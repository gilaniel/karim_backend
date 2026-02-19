import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';

@Controller('api/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findAll(): Promise<Activity[]> {
    return this.activitiesService.findAll();
  }

  @Get('active')
  findActive(): Promise<Activity | null> {
    return this.activitiesService.findActive();
  }

  @Get('statistics')
  getStatistics(@Query('date') date: string): Promise<any> {
    return this.activitiesService.getStatistics(new Date(date));
  }

  @Get('range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Activity[]> {
    return this.activitiesService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activitiesService.create(createActivityDto);
  }

  @Post('stop-active')
  stopActiveActivity(): Promise<Activity | null> {
    return this.activitiesService.stopActiveActivity();
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.activitiesService.remove(id);
  }
}
