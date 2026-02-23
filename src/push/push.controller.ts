// src/push/push.controller.ts
import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { PushService, NotificationPayload } from "./push.service";

// DTO для запросов
interface SubscriptionKeysDto {
  p256dh: string;
  auth: string;
}

// Класс для самой подписки
interface SubscriptionDto {
  endpoint: string;
  expirationTime: number | null;
  keys: SubscriptionKeysDto;
}

// Основной DTO для запроса
interface SubscribeDto {
  subscription: SubscriptionDto;
  userId?: string;
}

interface NotificationDto {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

@Controller("api/push")
export class PushController {
  private readonly logger = new Logger(PushController.name);

  constructor(private readonly pushService: PushService) {}

  /**
   * Подписка на уведомления
   */
  @Post("subscribe")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async subscribe(
    @Body() body: SubscribeDto,
    @Headers("user-agent") userAgent: string,
  ) {
    try {
      if (!body.subscription || !body.subscription.endpoint) {
        throw new BadRequestException("Invalid subscription data");
      }
      const subscription = await this.pushService.saveSubscription(
        body.subscription,
        body.userId,
        userAgent,
      );

      this.logger.log(`New subscription saved: ${subscription.id}`);

      return {
        success: true,
        message: "Successfully subscribed to push notifications",
        subscriptionId: subscription.id,
      };
    } catch (error) {
      this.logger.error(`Failed to save subscription: ${error.message}`);
      throw new BadRequestException("Failed to save subscription");
    }
  }

  /**
   * Отписка от уведомлений
   */
  @Delete("unsubscribe")
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Body("endpoint") endpoint: string) {
    if (!endpoint) {
      throw new BadRequestException("Endpoint is required");
    }

    await this.pushService.removeSubscription(endpoint);

    this.logger.log(`Subscription removed: ${endpoint}`);

    return {
      success: true,
      message: "Successfully unsubscribed",
    };
  }

  /**
   * Отправка уведомления конкретному пользователю
   */
  @Post("send/:userId")
  async sendToUser(
    @Param("userId") userId: string,
    @Body() notification: NotificationDto,
  ) {
    const result = await this.pushService.sendToUser(userId, notification);

    if (!result.success) {
      throw new BadRequestException(
        result.error || "Failed to send notification",
      );
    }

    return {
      success: true,
      message: "Notification sent successfully",
      userId,
    };
  }

  /**
   * Рассылка всем пользователям
   */
  @Post("broadcast")
  async broadcast(@Body() notification: NotificationDto) {
    const result = await this.pushService.sendToAll(notification);

    return {
      success: true,
      message: `Broadcast completed`,
      stats: result,
    };
  }

  /**
   * Рассылка всем, кроме указанного пользователя
   */
  @Post("broadcast-except/:userId")
  async broadcastExcept(
    @Param("userId") userId: string,
    @Body() notification: NotificationDto,
  ) {
    const result = await this.pushService.sendToAll(notification, {
      excludeUserId: userId,
    });

    return {
      success: true,
      message: `Broadcast completed (excluding user ${userId})`,
      stats: result,
    };
  }

  /**
   * Получение VAPID публичного ключа (для клиента)
   */
  @Get("vapid-public-key")
  getVapidPublicKey() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      throw new BadRequestException("VAPID public key not configured");
    }

    return {
      publicKey,
    };
  }

  /**
   * Получение статуса подписки
   */
  @Get("status/:userId")
  async getUserSubscriptionStatus(@Param("userId") userId: string) {
    const subscriptions = await this.pushService.getUserSubscriptions(userId);

    return {
      userId,
      isSubscribed: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        deviceInfo: sub.deviceInfo,
        createdAt: sub.createdAt,
        lastNotifiedAt: sub.lastNotifiedAt,
      })),
    };
  }

  /**
   * Админ: статистика по подпискам
   */
  @Get("admin/stats")
  async getStats() {
    const stats = await this.pushService.getStats();
    return stats;
  }

  /**
   * Админ: все активные подписки
   */
  @Get("admin/subscriptions")
  async getAllSubscriptions() {
    const subscriptions = await this.pushService.getActiveSubscriptions();
    return subscriptions;
  }
}
