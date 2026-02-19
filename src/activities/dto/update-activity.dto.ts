import { PartialType } from '@nestjs/swagger';
import { type ActivityType, CreateActivityDto } from './create-activity.dto';
import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsEnum(['SLEEP', 'AWAKE', 'FALLING_ASLEEP', 'FEEDING'])
  @IsOptional()
  type?: ActivityType;

  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  volumeMl?: number;
}
