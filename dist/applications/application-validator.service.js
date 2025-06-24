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
exports.ApplicationValidatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/enums/role.enum");
const client_1 = require("@prisma/client");
let ApplicationValidatorService = class ApplicationValidatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateCreation(submitter, targetUsername, type) {
        if (submitter.username === targetUsername) {
            throw new common_1.ForbiddenException('You cannot submit an application for yourself');
        }
        if (submitter.role === role_enum_1.Role.MEMBER && type !== client_1.ApplicationType.MEMBER) {
            throw new common_1.ForbiddenException('Members can only submit MEMBER applications');
        }
        if (![role_enum_1.Role.ADMIN, role_enum_1.Role.MEMBER].includes(submitter.role)) {
            throw new common_1.ForbiddenException('More permissions are required to submit an application');
        }
        const target = await this.prisma.user.findUnique({ where: { username: targetUsername } });
        if (!target)
            throw new common_1.NotFoundException('Target user not found');
        if (type === client_1.ApplicationType.ADMIN && target.role === role_enum_1.Role.BRO) {
            throw new common_1.ForbiddenException('Target must first be a MEMBER before applying for ADMIN');
        }
        if (type === client_1.ApplicationType.MEMBER && target.role === role_enum_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Cannot downgrade an ADMIN to MEMBER');
        }
        if ((type === client_1.ApplicationType.MEMBER && target.role === role_enum_1.Role.MEMBER) ||
            (type === client_1.ApplicationType.ADMIN && target.role === role_enum_1.Role.ADMIN)) {
            throw new common_1.ForbiddenException('Target user already has this role');
        }
        const existingApp = await this.prisma.application.findFirst({
            where: { targetUser: targetUsername, type },
        });
        if (existingApp) {
            throw new common_1.ForbiddenException(`An active ${type} application already exists for this user`);
        }
    }
};
exports.ApplicationValidatorService = ApplicationValidatorService;
exports.ApplicationValidatorService = ApplicationValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationValidatorService);
//# sourceMappingURL=application-validator.service.js.map