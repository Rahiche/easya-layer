"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
class Configuration {
    constructor(config) {
        this.config = {
            ...config
        };
    }
    static getInstance(config) {
        if (!Configuration.instance && config) {
            Configuration.instance = new Configuration(config);
        }
        return Configuration.instance;
    }
    getConfig() {
        return this.config;
    }
}
exports.Configuration = Configuration;
