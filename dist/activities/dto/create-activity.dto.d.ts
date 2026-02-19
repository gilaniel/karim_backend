export type ActivityType = 'SLEEP' | 'AWAKE' | 'FALLING_ASLEEP' | 'FEEDING';
export declare class CreateActivityDto {
    type: ActivityType;
    startTime: string;
    endTime?: string;
    volumeMl?: number;
}
