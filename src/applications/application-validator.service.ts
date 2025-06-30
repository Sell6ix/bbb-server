import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { ApplicationType } from '@prisma/client'

@Injectable()
export class ApplicationValidatorService {
  constructor(private prisma: PrismaService) {}

  async validateCreation(
    submitter: { username: string; role: Role },
    targetUsername: string,
    type: ApplicationType
  ) {
    if (submitter.username === targetUsername) {
      throw new ForbiddenException('You cannot create an application for yourself');
    }

    if (submitter.role === Role.MEMBER && type !== ApplicationType.MEMBER) {
      throw new ForbiddenException('As a MEMBER, you can only create MEMBER applications');
    }

    if (![Role.ADMIN, Role.MEMBER].includes(submitter.role)) {
      throw new ForbiddenException('You need higher permissions to create an application');
    }

    const target = await this.prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) throw new NotFoundException('User not found');

    if (type === ApplicationType.ADMIN && target.role === Role.BRO) {
      throw new ForbiddenException('User must become MEMBER before applying for ADMIN');
    }

    if (type === ApplicationType.MEMBER && target.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot change an ADMIN to MEMBER');
    }

    if (
      (type === ApplicationType.MEMBER && target.role === Role.MEMBER) ||
      (type === ApplicationType.ADMIN && target.role === Role.ADMIN)
    ) {
      throw new ForbiddenException('User already has this role');
    }

    const existingApp = await this.prisma.application.findFirst({
      where: { targetUser: targetUsername, type, status: {notIn: ["APPROVED", "DELETED"]}  },
    });

    if (existingApp) {
      throw new ForbiddenException(`There is already an active ${type} application for this user`);
    }
  }
}
