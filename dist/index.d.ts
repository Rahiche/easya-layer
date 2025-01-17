import { BaseBlockchainSDK } from './BaseBlockchainSDK';
import { EasyaConfig, NFT, NFTConfig, TransactionConfig, TransactionResult } from './core/types';
export declare class EasyaSDK extends BaseBlockchainSDK {
    private eventCallbacks;
    constructor(config: EasyaConfig);
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    isActive(): boolean;
    sendTransaction(config: TransactionConfig): Promise<TransactionResult>;
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    getBalance(address?: string): Promise<number>;
    getAddress(): Promise<string>;
    getNFTs(address?: string): Promise<NFT[]>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    isWalletInstalled(): Promise<boolean>;
    getCurrencySymbol(): string;
    subscribeToEvents(eventName: string, callback: (data: any) => void): Promise<void>;
    unsubscribeFromEvents(eventName: string): Promise<void>;
    protected handleError(operation: string, error: any): never;
}
