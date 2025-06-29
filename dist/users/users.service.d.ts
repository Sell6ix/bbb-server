import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    promoteToRole(userId: string, role: Role): Promise<{
        id: string;
        username: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
}
