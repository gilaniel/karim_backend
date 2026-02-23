// src/push/push.service.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as webpush from "web-push";
import { PushSubscription } from "./entities/push-subscription.entity";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  vibrate?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private subscriptionRepository: Repository<PushSubscription>,
  ) {}

  onModuleInit() {
    // Настройка VAPID ключей при инициализации модуля
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.VAPID_EMAIL;

    if (!publicKey || !privateKey || !email) {
      this.logger.error("VAPID keys not configured in environment variables");
      return;
    }

    webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);

    this.logger.log("Push service initialized with VAPID keys");
  }

  /**
   * Сохранение подписки пользователя
   */
  async saveSubscription(
    subscription: webpush.PushSubscription,
    userId?: string,
    deviceInfo?: string,
  ): Promise<PushSubscription> {
    // Проверяем, существует ли уже такая подписка
    const existing = await this.subscriptionRepository.findOne({
      where: {
        subscription: { endpoint: subscription.endpoint },
      } as any,
    });

    if (existing) {
      // Если подписка существует, но неактивна - реактивируем
      if (!existing.isActive) {
        existing.isActive = true;
        existing.subscription = subscription as any;
        existing.deviceInfo = deviceInfo || existing.deviceInfo;
        existing.updatedAt = new Date();
        return this.subscriptionRepository.save(existing);
      }

      // Если активна - возвращаем существующую (не создаем дубликат)
      this.logger.log(
        `Subscription already exists and is active: ${existing.id}`,
      );
      return existing;
    }

    // Создаем новую подписку
    const newSubscription = this.subscriptionRepository.create({
      userId,
      subscription: subscription as any,
      deviceInfo,
      isActive: true,
    });

    return this.subscriptionRepository.save(newSubscription);
  }

  /**
   * Удаление подписки
   */
  async removeSubscription(endpoint: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscription: { endpoint } } as any,
    });

    if (subscription) {
      // Мягкое удаление - помечаем как неактивную
      subscription.isActive = false;
      await this.subscriptionRepository.save(subscription);
      this.logger.log(`Subscription deactivated: ${subscription.id}`);

      // Отправляем уведомление об отписке (опционально)
      try {
        await webpush.sendNotification(
          subscription.subscription as webpush.PushSubscription,
          JSON.stringify({
            title: "Вы отписались",
            body: "Вы больше не будете получать уведомления",
            silent: true,
          }),
        );
      } catch (error) {
        // Игнорируем ошибку, так как подписка уже неактивна
      }
    }
  }

  /**
   * Деактивация подписки (помечаем как неактивную)
   */
  async deactivateSubscription(endpoint: string): Promise<void> {
    await this.subscriptionRepository.update(
      { subscription: { endpoint } as any },
      { isActive: false },
    );
  }

  /**
   * Получение всех активных подписок
   */
  async getActiveSubscriptions(): Promise<PushSubscription[]> {
    return this.subscriptionRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Получение подписок пользователя
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.subscriptionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Отправка уведомления конкретному пользователю
   */
  async sendToUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<{ success: boolean; error?: string }> {
    const subscriptions = await this.getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      return { success: false, error: "No active subscriptions found" };
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) => this.sendNotification(sub, payload)),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      this.logger.warn(
        `Failed to send to ${failed.length} subscriptions for user ${userId}`,
      );
    }

    return {
      success: failed.length === 0,
      error: failed.length > 0 ? "Some notifications failed" : undefined,
    };
  }

  /**
   * Отправка уведомления всем пользователям
   */
  async sendToAll(
    payload: NotificationPayload,
    options?: { excludeUserId?: string },
  ): Promise<{ total: number; successful: number; failed: number }> {
    const subscriptions = await this.getActiveSubscriptions();

    let filtered = subscriptions;
    if (options?.excludeUserId) {
      filtered = subscriptions.filter(
        (sub) => sub.userId !== options.excludeUserId,
      );
    }

    const results = await Promise.allSettled(
      filtered.map((sub) => this.sendNotification(sub, payload)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    this.logger.log(
      `Push notifications sent: ${successful} successful, ${failed} failed`,
    );

    return {
      total: filtered.length,
      successful,
      failed,
    };
  }

  /**
   * Отправка одного уведомления
   */
  private async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const serializedPayload = JSON.stringify({
        ...payload,
        data: {
          ...payload.data,
          timestamp: Date.now(),
        },
      });

      await webpush.sendNotification(
        subscription.subscription as webpush.PushSubscription,
        serializedPayload,
      );

      // Обновляем время последнего уведомления
      await this.subscriptionRepository.update(
        { id: subscription.id },
        { lastNotifiedAt: new Date() },
      );

      this.logger.debug(`Notification sent to ${subscription.id}`);
    } catch (error) {
      // Если подписка истекла или невалидна
      if (error.statusCode === 410) {
        this.logger.warn(
          `Subscription ${subscription.id} is expired, deactivating...`,
        );
        await this.deactivateSubscription(subscription.subscription.endpoint);
      }

      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация VAPID ключей (для административных целей)
   */
  generateVapidKeys(): { publicKey: string; privateKey: string } {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY || "",
      privateKey: process.env.VAPID_PRIVATE_KEY || "",
    };
  }

  /**
   * Получение статистики по подпискам
   */
  async getStats(): Promise<any> {
    const total = await this.subscriptionRepository.count();
    const active = await this.subscriptionRepository.count({
      where: { isActive: true },
    });
    const byDevice = await this.subscriptionRepository
      .createQueryBuilder("sub")
      .select("sub.deviceInfo", "device")
      .addSelect("COUNT(*)", "count")
      .where("sub.isActive = :active", { active: true })
      .groupBy("sub.deviceInfo")
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      byDevice,
    };
  }
}
