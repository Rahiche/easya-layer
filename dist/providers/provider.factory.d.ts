import { BlockchainProvider } from '../core/types';
export declare class ProviderFactory {
    static createProvider(blockchain: string, network: string): BlockchainProvider;
}
