import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { Application, ApplicationStatus, ApplicationType, User } from '@prisma/client';
import { ApplicationValidatorService } from './application-validator.service';
import { VotingService } from './voting.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private validator: ApplicationValidatorService,
    private votingService: VotingService,
  ) {}

  async mine(userId: string) {
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

  async create(
    submitter: { userId: string; username: string; role: Role },
    targetUsername: string,
    type: ApplicationType,
  ) {
    await this.validator.validateCreation(submitter, targetUsername, type);

    const initialApprover =
      submitter.role === Role.ADMIN
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

  async vote(user: any, applicationId: number) {
    const app = await this.votingService.vote(user.userId, applicationId);
    await this.updateStatus(applicationId);
    return app;
  }

  async unvote(user: any, applicationId: number) {
    const app = await this.votingService.unvote(user.userId, applicationId);
    await this.updateStatus(applicationId);
    return app;
  }

  async delete(submitterId: string, id: number) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app || app.submittedById !== submitterId) throw new ForbiddenException();
    await this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.CANCELLED },
    });
  }

  async getTargeted(username: string) {
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

  private computeStatus(app: Application & { approvers: User[] }): ApplicationStatus {
    const v = app.approvers.length;
    if (app.type === ApplicationType.ADMIN)   return v === 3 ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_UNANIMOUS;
    if (app.type === ApplicationType.MEMBER)  return v >= 2 ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_VOTES;
    return ApplicationStatus.PENDING;
  }

  private async updateStatus(applicationId: number) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { approvers: true },
    });
    if (!app) throw new NotFoundException();

    const status = this.computeStatus(app);
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async remove(id: number) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return this.prisma.application.delete({ where: { id } });
  }
}
