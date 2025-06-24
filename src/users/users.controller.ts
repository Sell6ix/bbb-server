import { Controller, Get, Req, UseGuards,Param, Query} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum'
@Controller('users')
export class UsersController {

  constructor(private prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    console.log('REQ.USER:', req.user);
    const userId = req.user.userId;
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });
}

@Get(':username')
async getByUsername(@Param('username') username: string) {
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

@Get()
async getUsers(@Query('role') role?: Role) {
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
}