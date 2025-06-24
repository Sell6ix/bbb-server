import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  
  async validate(username: string, password: string) {
    let user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      user = await this.prisma.user.create({ data: { username, passwordHash: hash, role: 'BRO' } });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException();
    return user;
  }
login(user: { id: string; role: string; username: string }) {
  const payload = {
    sub: user.id, 
    role: user.role,
    username: user.username,
  };
  return { access_token: this.jwt.sign(payload) };
}
}