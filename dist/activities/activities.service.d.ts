import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
export declare class ActivitiesService {
    private activitiesRepository;
    constructor(activitiesRepository: Repository<Activity>);
    findAll(): Promise<Activity[]>;
    findOne(id: string): Promise<Activity>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Activity[]>;
    findActive(): Promise<Activity | null>;
    create(createActivityDto: CreateActivityDto): Promise<Activity>;
    update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity>;
    remove(id: string): Promise<void>;
    stopActiveActivity(): Promise<Activity | null>;
    getStatistics(date: Date): Promise<any>;
}
