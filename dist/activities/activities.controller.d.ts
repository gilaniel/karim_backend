import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    findAll(): Promise<Activity[]>;
    findActive(): Promise<Activity | null>;
    getStatistics(date: string): Promise<any>;
    findByDateRange(startDate: string, endDate: string): Promise<Activity[]>;
    findOne(id: string): Promise<Activity>;
    create(createActivityDto: CreateActivityDto): Promise<Activity>;
    stopActiveActivity(): Promise<Activity | null>;
    update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity>;
    remove(id: string): Promise<void>;
}
