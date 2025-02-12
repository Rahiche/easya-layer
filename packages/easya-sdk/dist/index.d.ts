import { BaseBlockchainSDK } from './BaseBlockchainSDK';
import { Balance, EasyaConfig, NFT, NFTConfig, TokenIssuanceData, TransactionConfig, TransactionResult } from './core/types';
export declare class EasyaSDK extends BaseBlockchainSDK {
    private eventCallbacks;
    constructor(config: EasyaConfig);
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    isActive(): boolean;
    sendTransaction(config: TransactionConfig & {
        currency?: string;
        issuer?: string;
    }): Promise<TransactionResult>;
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    issueToken(config: TokenIssuanceData): Promise<TransactionResult>;
    getBalances(): Promise<Balance[]>;
    getBalance(address?: string): Promise<number>;
    getAddress(): Promise<string>;
    getNFTs(address?: string): Promise<NFT[]>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    isWalletInstalled(): Promise<boolean>;
    getBlockchain(): string;
    getCurrencySymbol(): string;
    subscribeToEvents(eventName: string, callback: (data: any) => void): Promise<void>;
    unsubscribeFromEvents(eventName: string): Promise<void>;
    protected handleError(operation: string, error: any): never;
}
