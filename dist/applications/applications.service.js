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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/enums/role.enum");
const client_1 = require("@prisma/client");
const application_validator_service_1 = require("./application-validator.service");
const voting_service_1 = require("./voting.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    validator;
    votingService;
    constructor(prisma, validator, votingService) {
        this.prisma = prisma;
        this.validator = validator;
        this.votingService = votingService;
    }
    async mine(userId) {
        const apps = await this.prisma.application.findMany({
            where: {
                OR: [{ targetUser: userId }, { submittedById: userId }],
            },
            include: {
                submittedBy: { select: { username: true } },
                approvers: { select: { username: true } },
            },
        });
        return apps.map(app => ({
            ...app,
            status: app.status,
            submittedBy: app.submittedBy.username,
            votes: app.approvers.map(a => a.username),
        }));
    }
    async all() {
        const apps = await this.prisma.application.findMany({
            include: {
                submittedBy: { select: { username: true } },
                approvers: { select: { username: true } },
            },
        });
        return apps.map(app => ({
            ...app,
            status: app.status,
            submittedBy: app.submittedBy.username,
            votes: app.approvers.map(a => a.username),
        }));
    }
    async create(submitter, targetUsername, type) {
        await this.validator.validateCreation(submitter, targetUsername, type);
        const initialApprover = submitter.role === role_enum_1.Role.ADMIN
            ? { connect: { id: submitter.userId } }
            : undefined;
        const app = await this.prisma.application.create({
            data: {
                targetUser: targetUsername,
                type,
                submittedById: submitter.userId,
                approvers: initialApprover,
            },
            include: { approvers: true },
        });
        const status = this.computeStatus(app);
        const updatedApp = await this.prisma.application.update({
            where: { id: app.id },
            data: { status },
            include: {
                approvers: { select: { username: true } },
                submittedBy: { select: { username: true } },
            },
        });
        return {
            ...updatedApp,
            submittedBy: updatedApp.submittedBy.username,
            votes: updatedApp.approvers.map(a => a.username),
        };
    }
    async vote(user, applicationId) {
        const app = await this.votingService.vote(user.userId, applicationId);
        await this.updateStatus(applicationId);
        return app;
    }
    async unvote(user, applicationId) {
        const app = await this.votingService.unvote(user.userId, applicationId);
        await this.updateStatus(applicationId);
        return app;
    }
    async delete(submitterId, id) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app || app.submittedById !== submitterId)
            throw new common_1.ForbiddenException();
        await this.prisma.application.update({
            where: { id },
            data: { status: client_1.ApplicationStatus.CANCELLED },
        });
    }
    async getTargeted(username) {
        const apps = await this.prisma.application.findMany({
            where: { targetUser: username },
            include: {
                submittedBy: { select: { username: true } },
                approvers: { select: { username: true } },
            },
        });
        return apps.map(app => ({
            ...app,
            status: app.status,
            submittedBy: app.submittedBy.username,
            votes: app.approvers.map(a => a.username),
        }));
    }
    computeStatus(app) {
        const v = app.approvers.length;
        if (app.type === client_1.ApplicationType.ADMIN)
            return v === 3 ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_UNANIMOUS;
        if (app.type === client_1.ApplicationType.MEMBER)
            return v >= 2 ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.WAITING_VOTES;
        return client_1.ApplicationStatus.PENDING;
    }
    async updateStatus(applicationId) {
        const app = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { approvers: true },
        });
        if (!app)
            throw new common_1.NotFoundException();
        const status = this.computeStatus(app);
        await this.prisma.application.update({
            where: { id: applicationId },
            data: { status },
        });
    }
    async remove(id) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        return this.prisma.application.delete({ where: { id } });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        application_validator_service_1.ApplicationValidatorService,
        voting_service_1.VotingService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map