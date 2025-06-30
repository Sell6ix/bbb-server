import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ApplicationStatus, Application, User } from '@prisma/client';

@Injectable()
export class VotingService {
  constructor(private prisma: PrismaService) {}

private allAdminsVoted(approverIds: string[], adminIds: string[]): boolean {
  return adminIds.every(id => approverIds.includes(id));
}

public computeStatus(
  app: Application & { approvers: User[] },
  adminIds: string[]
): ApplicationStatus {
  const approverIds = app.approvers.map(a => a.id);

console.log('Application type:', app.type);

  if (app.type === 'ADMIN') {
    const allAdminVoted = this.allAdminsVoted(approverIds, adminIds);
    return allAdminVoted ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_UNANIMOUS;
  }

  if (app.type === 'MEMBER') {
    const votes = approverIds.filter(id => adminIds.includes(id)).length;
    return votes >= 2 ? ApplicationStatus.APPROVED : ApplicationStatus.WAITING_VOTES;
  }

  return ApplicationStatus.PENDING;
}



async vote(userId: string, appId: number) {
  const app = await this.prisma.application.findUnique({
    where: { id: appId },
    include: { approvers: true },
  });
  if (!app) throw new NotFoundException('Application not found');

  const adminsBefore = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
  const adminIdsBefore = adminsBefore.map(a => a.id);
  console.log('adminsBefore',adminsBefore);

  let updatedApp = await this.prisma.application.update({
    where: { id: appId },
    data: {
      approvers: { connect: { id: userId } },
    },
    include: { approvers: true },
  });

  const approverIds = updatedApp.approvers.map(a => a.id);
  let status: ApplicationStatus;

  const allAdminsVoted = this.allAdminsVoted(approverIds, adminIdsBefore);
  if (app.type === 'ADMIN' && allAdminsVoted) {
    await this.promoteTarget(app.targetUser, Role.ADMIN);
    status = ApplicationStatus.APPROVED;
  }

  else if (app.type === 'MEMBER') {
    const votes = approverIds.filter(id => adminIdsBefore.includes(id)).length;
    if (votes >= 2) {
      await this.promoteTarget(app.targetUser, Role.MEMBER);
      status = ApplicationStatus.APPROVED;
    } else {
      status = ApplicationStatus.WAITING_VOTES;
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


  async unvote(userId: string, appId: number) {
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
