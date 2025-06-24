import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationsController {
    private svc;
    private prisma;
    constructor(svc: ApplicationsService, prisma: PrismaService);
    mine(req: any): Promise<{
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
    create(req: any, body: {
        targetUser: string;
        type: 'MEMBER' | 'ADMIN';
    }): Promise<{
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
    vote(req: any, id: number): Promise<{
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
    unvote(req: any, id: number): Promise<{
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
    delete(req: any, id: number): Promise<void>;
    getApplicationsTargeting(username: string): Promise<{
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
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        targetUser: string;
        type: import(".prisma/client").$Enums.ApplicationType;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        submittedById: string;
    }>;
}
