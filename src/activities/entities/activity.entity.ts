import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type ActivityType = 'SLEEP' | 'AWAKE' | 'FALLING_ASLEEP' | 'FEEDING';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['SLEEP', 'AWAKE', 'FALLING_ASLEEP', 'FEEDING'],
  })
  @Index()
  type: ActivityType;

  @Column({ type: 'timestamp' })
  @Index()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null | undefined;

  @Column({ nullable: true })
  volumeMl: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
