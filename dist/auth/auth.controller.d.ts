import { AuthService } from './auth.service';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
}
