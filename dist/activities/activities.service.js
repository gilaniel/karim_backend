"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_entity_1 = require("./entities/activity.entity");
let ActivitiesService = class ActivitiesService {
    activitiesRepository;
    constructor(activitiesRepository) {
        this.activitiesRepository = activitiesRepository;
    }
    async findAll() {
        return this.activitiesRepository.find({
            order: {
                startTime: 'DESC',
            },
        });
    }
    async findOne(id) {
        const activity = await this.activitiesRepository.findOne({ where: { id } });
        if (!activity) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
        return activity;
    }
    async findByDateRange(startDate, endDate) {
        return this.activitiesRepository.find({
            where: {
                startTime: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: {
                startTime: 'DESC',
            },
        });
    }
    async findActive() {
        return this.activitiesRepository.findOne({
            where: {
                endTime: (0, typeorm_2.IsNull)(),
                type: 'FEEDING',
            },
        });
    }
    async create(createActivityDto) {
        const activity = this.activitiesRepository.create({
            ...createActivityDto,
            startTime: new Date(createActivityDto.startTime),
            endTime: createActivityDto.endTime
                ? new Date(createActivityDto.endTime)
                : null,
        });
        return this.activitiesRepository.save(activity);
    }
    async update(id, updateActivityDto) {
        const activity = await this.findOne(id);
        if (updateActivityDto.startTime) {
            updateActivityDto.startTime = new Date(updateActivityDto.startTime);
        }
        if (updateActivityDto.endTime) {
            updateActivityDto.endTime = new Date(updateActivityDto.endTime);
        }
        Object.assign(activity, updateActivityDto);
        return this.activitiesRepository.save(activity);
    }
    async remove(id) {
        const result = await this.activitiesRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
    }
    async stopActiveActivity() {
        const activeActivity = await this.findActive();
        if (activeActivity) {
            activeActivity.endTime = new Date();
            return this.activitiesRepository.save(activeActivity);
        }
        return null;
    }
    async getStatistics(date) {
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
        const totalMilk = feedingActivities.reduce((acc, curr) => acc + (curr.volumeMl || 0), 0);
        return {
            date: startOfDay.toISOString().split('T')[0],
            totalSleepHours: (totalSleepMs / (1000 * 60 * 60)).toFixed(1),
            totalFeedings,
            totalMilk,
        };
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_entity_1.Activity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map