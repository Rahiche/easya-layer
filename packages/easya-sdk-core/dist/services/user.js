"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    constructor(client) {
        this.client = client;
    }
    async getProfile(userId) {
        return this.client.request(`/users/${userId}`, 'GET');
    }
}
exports.UserService = UserService;
