import { NFTConfig, TransactionConfig } from './core/types';
export declare class EasyaSDK {
    private config;
    private provider;
    private isConnected;
    constructor();
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    isActive(): boolean;
    /**
     * Sends a transaction using the configured blockchain provider
     * @param config Transaction configuration parameters
     * @returns Promise containing the transaction result
     * @throws Error if not connected or if transaction fails
     */
    sendTransaction(config: TransactionConfig): Promise<import("./core/types").TransactionResult>;
    /**
     * Validates transaction configuration parameters
     * @param config Transaction configuration to validate
     * @throws Error if config is invalid
     */
    private validateTransactionConfig;
    /**
     * Mints a new NFT using the configured blockchain provider
     * @param config NFT configuration parameters
     * @returns Promise containing the transaction result
     * @throws Error if not connected or if minting fails
     */
    mintNFT(config: NFTConfig): Promise<import("./core/types").TransactionResult>;
    /**
     * Validates NFT configuration parameters
     * @param config NFT configuration to validate
     * @throws Error if config is invalid
     */
    private validateNFTConfig;
    /**
   * Gets the balance for a given address or the connected wallet
   * @param address Optional address to check balance for
   * @returns Promise containing the balance as a string
   * @throws Error if not connected or if balance check fails
   */
    getBalance(address?: string): Promise<number>;
    getCurrencySymbol(): string;
}
