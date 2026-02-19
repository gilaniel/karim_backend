import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activitiesRepository.find({
      order: {
        startTime: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        startTime: Between(startDate, endDate),
      },
      order: {
        startTime: 'DESC',
      },
    });
  }

  async findActive(): Promise<Activity | null> {
    return this.activitiesRepository.findOne({
      where: {
        endTime: IsNull(),
        type: 'FEEDING', // FEEDING всегда имеет endTime, так что это исключит его
      },
    });
  }

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      startTime: new Date(createActivityDto.startTime),
      endTime: createActivityDto.endTime
        ? new Date(createActivityDto.endTime)
        : null,
    });

    return this.activitiesRepository.save(activity);
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    // Преобразуем строки в Date если они есть
    if (updateActivityDto.startTime) {
      updateActivityDto.startTime = new Date(
        updateActivityDto.startTime,
      ) as any;
    }
    if (updateActivityDto.endTime) {
      updateActivityDto.endTime = new Date(updateActivityDto.endTime) as any;
    }

    Object.assign(activity, updateActivityDto);

    return this.activitiesRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.activitiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
  }

  // Специальный метод для остановки активной активности
  async stopActiveActivity(): Promise<Activity | null> {
    const activeActivity = await this.findActive();
    if (activeActivity) {
      activeActivity.endTime = new Date();
      return this.activitiesRepository.save(activeActivity);
    }
    return null;
  }

  // Метод для получения статистики
  async getStatistics(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await this.findByDateRange(startOfDay, endOfDay);

    const sleepActivities = activities.filter((a) => a.type === 'SLEEP');
    const feedingActivities = activities.filter((a) => a.type === 'FEEDING');

    const totalSleepMs = sleepActivities.reduce((acc, curr) => {
      if (curr.endTime) {
        return acc + (curr.endTime.getTime() - curr.startTime.getTime());
      }
      return acc;
    }, 0);

    const totalFeedings = feedingActivities.length;
    const totalMilk = feedingActivities.reduce(
      (acc, curr) => acc + (curr.volumeMl || 0),
      0,
    );

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalSleepHours: (totalSleepMs / (1000 * 60 * 60)).toFixed(1),
      totalFeedings,
      totalMilk,
    };
  }
}
