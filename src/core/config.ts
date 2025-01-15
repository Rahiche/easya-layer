import { EasyaConfig } from './types';

export class Configuration {
    private static instance: Configuration;
    private config: EasyaConfig;

    private constructor(config: EasyaConfig) {
        this.config = {
            ...config
        };
    }

    public static getInstance(config?: EasyaConfig): Configuration {
        if (!Configuration.instance && config) {
            Configuration.instance = new Configuration(config);
        }
        return Configuration.instance;
    }

    public getConfig(): EasyaConfig {
        return this.config;
    }
}