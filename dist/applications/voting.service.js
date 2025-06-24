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
exports.VotingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let VotingService = class VotingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    computeStatus(app) {
        const votes = app.approvers.length;
        if (app.type === 'ADMIN')
            return votes === 3 ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_UNANIMOUS;
        if (app.type === 'MEMBER')
            return votes >= 2 ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_VOTES;
        return client_1.ApplicationStatus.PENDING;
    }
    async vote(userId, appId) {
        const app = await this.prisma.application.findUnique({
            where: { id: appId },
            include: { approvers: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const updatedApp = await this.prisma.application.update({
            where: { id: appId },
            data: {
                approvers: { connect: { id: userId } },
            },
            include: { approvers: true },
        });
        const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
        const adminIds = admins.map(a => a.id);
        const approverIds = updatedApp.approvers.map(a => a.id);
        if (app.type === 'MEMBER' &&
            approverIds.filter(id => adminIds.includes(id)).length >= 2) {
            await this.promoteTarget(app.targetUser, client_1.Role.MEMBER);
        }
        if (app.type === 'ADMIN' &&
            adminIds.every(id => approverIds.includes(id))) {
            await this.promoteTarget(app.targetUser, client_1.Role.ADMIN);
        }
        const status = this.computeStatus(updatedApp);
        const finalApp = await this.prisma.application.update({
            where: { id: appId },
            data: { status: status },
            include: {
                submittedBy: { select: { username: true } },
                approvers: { select: { username: true } },
            },
        });
        return {
            ...finalApp,
            submittedBy: finalApp.submittedBy.username,
            votes: finalApp.approvers.map(a => a.username),
        };
    }
    async unvote(userId, appId) {
        const app = await this.prisma.application.update({
            where: { id: appId },
            data: {
                approvers: { disconnect: { id: userId } },
            },
            include: { approvers: true },
        });
        const status = this.computeStatus(app);
        const finalApp = await this.prisma.application.update({
            where: { id: appId },
            data: { status: status },
            include: {
                submittedBy: { select: { username: true } },
                approvers: { select: { username: true } },
            },
        });
        return {
            ...finalApp,
            submittedBy: finalApp.submittedBy.username,
            votes: finalApp.approvers.map(a => a.username),
        };
    }
    async promoteTarget(username, role) {
        await this.prisma.user.update({
            where: { username },
            data: { role },
        });
    }
};
exports.VotingService = VotingService;
exports.VotingService = VotingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VotingService);
//# sourceMappingURL=voting.service.js.map