import { PrismaService } from '../prisma/prisma.service';
export declare class VotingService {
    private prisma;
    constructor(prisma: PrismaService);
    private computeStatus;
    vote(userId: string, appId: number): Promise<{
        submittedBy: string;
        votes: string[];
        approvers: {
            username: string;
        }[];
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedById: string;
    }>;
    unvote(userId: string, appId: number): Promise<{
        submittedBy: string;
        votes: string[];
        approvers: {
            username: string;
        }[];
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedById: string;
    }>;
    private promoteTarget;
}
