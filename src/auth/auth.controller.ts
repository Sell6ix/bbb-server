import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login') async login(@Body() body: { username: string; password: string }) {
    const user = await this.auth.validate(body.username, body.password);
    return this.auth.login(user);
  }
}