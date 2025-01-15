import { EasyaClient } from '../core/client';

export class UserService {
    private client: EasyaClient;

    constructor(client: EasyaClient) {
        this.client = client;
    }

    async getProfile(userId: string) {
        return this.client.request(`/users/${userId}`, 'GET');
    }
}