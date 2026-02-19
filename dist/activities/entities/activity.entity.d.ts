export type ActivityType = 'SLEEP' | 'AWAKE' | 'FALLING_ASLEEP' | 'FEEDING';
export declare class Activity {
    id: string;
    type: ActivityType;
    startTime: Date;
    endTime: Date | null | undefined;
    volumeMl: number;
    createdAt: Date;
    updatedAt: Date;
}
