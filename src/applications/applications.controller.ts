import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
constructor(
  private svc: ApplicationsService,
  private prisma: PrismaService
) {}

  @Get('mine') mine(@Req() req) { return this.svc.mine(req.user.userId); }
  @Roles(Role.ADMIN)
  @Get() all() { return this.svc.all(); }
  @Post() create(@Req() req, @Body() body: { targetUser: string; type: 'MEMBER' | 'ADMIN' }) { return this.svc.create(req.user, body.targetUser, body.type); }
  @Patch(':id/vote') @Roles(Role.ADMIN) vote(@Req() req, @Param('id') id: number) { return this.svc.vote(req.user, +id); }
  @Patch(':id/unvote') @Roles(Role.ADMIN) unvote(@Req() req, @Param('id') id: number) { return this.svc.unvote(req.user, +id); }
  @Delete(':id') delete(@Req() req, @Param('id') id: number) { return this.svc.delete(req.user.userId, +id); }
  @Get('targeting/:username')
getApplicationsTargeting(@Param('username') username: string) {
  return this.svc.getTargeted(username);
}
@Delete(':id')
remove(@Param('id') id: string) {
  return this.svc.remove(+id);
}
}