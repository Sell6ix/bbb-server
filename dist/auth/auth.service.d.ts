import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validate(username: string, password: string): Promise<{
        id: string;
        username: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    login(user: {
        id: string;
        role: string;
        username: string;
    }): {
        access_token: string;
    };
}
