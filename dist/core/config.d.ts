import { EasyaConfig } from './types';
export declare class Configuration {
    private static instance;
    private config;
    private constructor();
    static getInstance(config?: EasyaConfig): Configuration;
    getConfig(): EasyaConfig;
}
