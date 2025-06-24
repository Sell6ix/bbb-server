import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(req: any): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getByUsername(username: string): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
    } | null>;
    getUsers(role?: Role): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
