import { type ActivityType, CreateActivityDto } from './create-activity.dto';
declare const UpdateActivityDto_base: import("@nestjs/common").Type<Partial<CreateActivityDto>>;
export declare class UpdateActivityDto extends UpdateActivityDto_base {
    type?: ActivityType;
    startTime?: string;
    endTime?: string;
    volumeMl?: number;
}
export {};
