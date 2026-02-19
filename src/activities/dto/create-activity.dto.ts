import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type ActivityType = 'SLEEP' | 'AWAKE' | 'FALLING_ASLEEP' | 'FEEDING';

export class CreateActivityDto {
  @IsEnum(['SLEEP', 'AWAKE', 'FALLING_ASLEEP', 'FEEDING'])
  type: ActivityType;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  volumeMl?: number;
}
