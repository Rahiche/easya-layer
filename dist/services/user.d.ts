import { EasyaClient } from '../core/client';
export declare class UserService {
    private client;
    constructor(client: EasyaClient);
    getProfile(userId: string): Promise<unknown>;
}
