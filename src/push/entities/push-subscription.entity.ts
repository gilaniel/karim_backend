import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("push_subscriptions")
export class PushSubscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  @Index()
  userId: string; // ID пользователя в вашей системе

  @Column("jsonb")
  subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  @Column({ nullable: true })
  deviceInfo: string; // Информация об устройстве/браузере

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastNotifiedAt: Date;
}
