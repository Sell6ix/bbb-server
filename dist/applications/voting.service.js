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
    allAdminsVoted(approverIds, adminIds) {
        return adminIds.every(id => approverIds.includes(id));
    }
    computeStatus(app, adminIds) {
        const approverIds = app.approvers.map(a => a.id);
        console.log('Application type:', app.type);
        if (app.type === 'ADMIN') {
            const allAdminVoted = this.allAdminsVoted(approverIds, adminIds);
            return allAdminVoted ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_UNANIMOUS;
        }
        if (app.type === 'MEMBER') {
            const votes = approverIds.filter(id => adminIds.includes(id)).length;
            return votes >= 2 ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_VOTES;
        }
        return client_1.ApplicationStatus.PENDING;
    }
    async vote(userId, appId) {
        const app = await this.prisma.application.findUnique({
            where: { id: appId },
            include: { approvers: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const adminsBefore = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
        const adminIdsBefore = adminsBefore.map(a => a.id);
        console.log('adminsBefore', adminsBefore);
        let updatedApp = await this.prisma.application.update({
            where: { id: appId },
            data: {
                approvers: { connect: { id: userId } },
            },
            include: { approvers: true },
        });
        const approverIds = updatedApp.approvers.map(a => a.id);
        let status;
        const allAdminsVoted = this.allAdminsVoted(approverIds, adminIdsBefore);
        if (app.type === 'ADMIN' && allAdminsVoted) {
            await this.promoteTarget(app.targetUser, client_1.Role.ADMIN);
            status = client_1.ApplicationStatus.APPROVED;
        }
        else if (app.type === 'MEMBER') {
            const votes = approverIds.filter(id => adminIdsBefore.includes(id)).length;
            if (votes >= 2) {
                await this.promoteTarget(app.targetUser, client_1.Role.MEMBER);
                status = client_1.ApplicationStatus.APPROVED;
            }
            else {
                status = client_1.ApplicationStatus.WAITING_VOTES;
            }
        }
        else {
            status = this.computeStatus(updatedApp, adminIdsBefore);
        }
        const finalApp = await this.prisma.application.update({
            where: { id: appId },
            data: { status },
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
        const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
        const adminIds = admins.map(a => a.id);
        const status = this.computeStatus(app, adminIds);
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