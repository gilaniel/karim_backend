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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActivityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_activity_dto_1 = require("./create-activity.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateActivityDto extends (0, swagger_1.PartialType)(create_activity_dto_1.CreateActivityDto) {
    type;
    startTime;
    endTime;
    volumeMl;
}
exports.UpdateActivityDto = UpdateActivityDto;
__decorate([
    (0, class_validator_1.IsEnum)(['SLEEP', 'AWAKE', 'FALLING_ASLEEP', 'FEEDING']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActivityDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActivityDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActivityDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateActivityDto.prototype, "volumeMl", void 0);
//# sourceMappingURL=update-activity.dto.js.map