import { BlockchainProvider, NFTConfig, TokenConfig, TransactionConfig, TransactionResult, WalletInfo } from "../core/types";
import { Client } from "xrpl";
export declare class XRPLProvider implements BlockchainProvider {
    private wallet;
    private connection;
    private network;
    private static readonly NETWORKS;
    constructor(network?: string);
    getBalance(address?: string): Promise<number>;
    getTransactionStatus(hash: string): Promise<TransactionResult>;
    getWalletInfo(): Promise<WalletInfo>;
    estimateFee(config: TransactionConfig): Promise<string>;
    validateAddress(address: string): boolean;
    transferToken(config: TransactionConfig): Promise<TransactionResult>;
    getTokenBalance(tokenId: string, address?: string): Promise<string>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    getNFTBalance(address?: string): Promise<Array<string>>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
    isConnected(): boolean;
    getBlockHeight(): Promise<number>;
    sign(message: string): Promise<string>;
    verify(message: string, signature: string, address: string): Promise<boolean>;
    subscribeToEvents(eventName: string, callback: (data: any) => void): void;
    unsubscribeFromEvents(eventName: string): void;
    connect(): Promise<string>;
    connectToWallet(): Promise<{
        address: string;
        publicKey: string;
    }>;
    establishConnection(): Promise<Client>;
    disconnect(): Promise<void>;
    /**
    * Send a transaction on XRPL
    * @param destination Destination address
    * @param amount Amount to send (in drops)
    * @param options Additional transaction options
    */
    sendTransaction(config: TransactionConfig): Promise<TransactionResult>;
    /**
        * Mint an NFT on XRPL
        * @param config NFT configuration
        */
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    /**
     * Mint a new token on XRPL
     * @param config Token configuration
     */
    mintToken(config: TokenConfig): Promise<TransactionResult>;
    getConnection(): Client;
    getWallet(): any;
    getNetwork(): string;
}
