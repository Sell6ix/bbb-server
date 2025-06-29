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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/enums/role.enum");
let UsersController = class UsersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getMe(req) {
        console.log('REQ.USER:', req.user);
        const userId = req.user.userId;
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, role: true },
        });
    }
    async getByUsername(username) {
        return this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username
                },
            },
            select: {
                id: true,
                username: true,
                role: true,
            },
        });
    }
    async getUsers(role) {
        if (role) {
            return this.prisma.user.findMany({
                where: { role },
                select: { id: true, username: true, role: true },
            });
        }
        return this.prisma.user.findMany({
            select: { id: true, username: true, role: true },
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getByUsername", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map