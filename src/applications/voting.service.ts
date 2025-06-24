import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ApplicationStatus, Application, User } from '@prisma/client';

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

private computeStatus(app: Application & { approvers: User[] }): ApplicationStatus {
  const votes = app.approvers.length;
  if (app.type === 'ADMIN')   return votes === 3 ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_UNANIMOUS;
  if (app.type === 'MEMBER')  return votes >= 2 ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_VOTES;
  return ApplicationStatus.PENDING;
}

  async vote(userId: string, appId: number) {
    const app = await this.prisma.application.findUnique({
      where: { id: appId },
      include: { approvers: true },
    });
    if (!app) throw new NotFoundException('Application not found');

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

    if (
      app.type === 'MEMBER' &&
      approverIds.filter(id => adminIds.includes(id)).length >= 2
    ) {
      await this.promoteTarget(app.targetUser, Role.MEMBER);
    }

    if (
      app.type === 'ADMIN' &&
      adminIds.every(id => approverIds.includes(id))
    ) {
      await this.promoteTarget(app.targetUser, Role.ADMIN);
    }

    const status = this.computeStatus(updatedApp);

    const finalApp = await this.prisma.application.update({
      where: { id: appId },
      data: { status: status as ApplicationStatus },
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

  async unvote(userId: string, appId: number) {
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
      data: { status: status as ApplicationStatus },
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

  private async promoteTarget(username: string, role: Role) {
    await this.prisma.user.update({
      where: { username },
      data: { role },
    });
  }
}
