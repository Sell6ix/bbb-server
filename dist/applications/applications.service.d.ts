import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { ApplicationType } from '@prisma/client';
import { ApplicationValidatorService } from './application-validator.service';
import { VotingService } from './voting.service';
export declare class ApplicationsService {
    private prisma;
    private validator;
    private votingService;
    constructor(prisma: PrismaService, validator: ApplicationValidatorService, votingService: VotingService);
    mine(userId: string): Promise<{
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedBy: string;
        votes: string[];
        approvers: {
            username: string;
        }[];
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        submittedById: string;
    }[]>;
    all(): Promise<{
        submittedBy: string;
        votes: string[];
        votesRequired: number;
        approvers: {
            id: string;
            username: string;
        }[];
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedById: string;
    }[]>;
    create(submitter: {
        userId: string;
        username: string;
        role: Role;
    }, targetUsername: string, type: ApplicationType): Promise<{
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
    vote(user: any, applicationId: number): Promise<{
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
    unvote(user: any, applicationId: number): Promise<{
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
    delete(submitterId: string, id: number): Promise<void>;
    getTargeted(username: string): Promise<{
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedBy: string;
        votes: string[];
        approvers: {
            username: string;
        }[];
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        submittedById: string;
    }[]>;
    private updateStatus;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedById: string;
    }>;
}
