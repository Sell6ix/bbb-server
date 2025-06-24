import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { ApplicationType } from '@prisma/client';
export declare class ApplicationValidatorService {
    private prisma;
    constructor(prisma: PrismaService);
    validateCreation(submitter: {
        username: string;
        role: Role;
    }, targetUsername: string, type: ApplicationType): Promise<void>;
}
