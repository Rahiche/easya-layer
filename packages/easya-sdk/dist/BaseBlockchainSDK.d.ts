import { BlockchainProvider, CurrencyTransactionConfig, EasyaConfig, NFTConfig, TransactionConfig, TransactionResult, TrustLineConfig } from './core/types';
export declare abstract class BaseBlockchainSDK {
    readonly config: EasyaConfig;
    protected readonly provider: BlockchainProvider;
    protected isConnected: boolean;
    protected currentAddress: string | null;
    constructor(config: EasyaConfig, provider: BlockchainProvider);
    protected ensureConnected(): void;
    protected getTargetAddress(address?: string): Promise<string>;
    protected validateTransactionConfig(config: TransactionConfig): void;
    protected validateNFTConfig(config: NFTConfig): void;
    protected validateTransferNFTParams(tokenId: string, to: string): void;
    protected validateAddressFormat(address: string): void;
    protected handleError(operation: string, error: unknown): never;
    protected getCurrencySymbol(): string;
    createTrustLine(config: TrustLineConfig): Promise<TransactionResult>;
    sendCurrency(config: CurrencyTransactionConfig): Promise<TransactionResult>;
}
