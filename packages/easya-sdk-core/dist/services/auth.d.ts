import { EasyaClient } from '../core/client';
export declare class AuthService {
    private client;
    constructor(client: EasyaClient);
    login(username: string, password: string): Promise<unknown>;
}
