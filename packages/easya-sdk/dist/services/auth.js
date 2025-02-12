"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
class AuthService {
    constructor(client) {
        this.client = client;
    }
    async login(username, password) {
        return this.client.request('/auth/login', 'POST', {});
    }
}
exports.AuthService = AuthService;
