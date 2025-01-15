import { EasyaClient } from '../core/client';

export class AuthService {
    private client: EasyaClient;

    constructor(client: EasyaClient) {
        this.client = client;
    }

    async login(username: string, password: string) {
        return this.client.request('/auth/login', 'POST', {
        });
    }
}
