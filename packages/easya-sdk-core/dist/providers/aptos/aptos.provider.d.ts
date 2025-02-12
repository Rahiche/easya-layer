import { Balance, BlockchainProvider, CurrencyTransactionConfig, NFT, NFTConfig, TokenConfig, TokenIssuanceData, TokenIssuanceResult, TransactionConfig, TransactionResult, TrustLineConfig, WalletInfo } from "../../core/types";
import { AptosUtils } from "./AptosUtils";
import { XRPLUtils } from "../xrpl/XRPLUtils";
export interface AptosBlockchainProvider extends BlockchainProvider {
    utils: AptosUtils;
}
export declare class AptosProvider implements AptosBlockchainProvider {
    private wallet;
    private network;
    private aptos;
    private static readonly NETWORKS;
    utils: AptosUtils;
    constructor(network?: string);
    xrplUtils(): XRPLUtils;
    createTrustLine(config: TrustLineConfig): Promise<TransactionResult>;
    sendCurrency(config: CurrencyTransactionConfig): Promise<TransactionResult>;
    getBalances(address?: string): Promise<Balance[]>;
    issueToken(config: TokenIssuanceData): Promise<TransactionResult>;
    issueFungibleToken(config: TokenConfig): Promise<TokenIssuanceResult>;
    disconnect(): Promise<void>;
    establishConnection(): Promise<any>;
    getTransactionStatus(hash: string): Promise<TransactionResult>;
    estimateFee(config: TransactionConfig): Promise<string>;
    validateAddress(address: string): boolean;
    mintToken(config: TokenConfig): Promise<TransactionResult>;
    transferToken(config: TransactionConfig): Promise<TransactionResult>;
    getTokenBalance(tokenId: string, address?: string): Promise<string>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
    getNFTs(address?: string): Promise<Array<NFT>>;
    getNetwork(): string;
    isConnected(): boolean;
    getBlockHeight(): Promise<number>;
    sign(message: string): Promise<string>;
    verify(message: string, signature: string, address: string): Promise<boolean>;
    subscribeToEvents(eventName: string, callback: (data: any) => void): void;
    unsubscribeFromEvents(eventName: string): void;
    isWalletInstalled(): Promise<boolean>;
    connect(): Promise<string>;
    sendTransaction(config: TransactionConfig): Promise<TransactionResult>;
    private collectionExists;
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    getOwnedTokens(address: string): Promise<any>;
    getCollectionData(collectionName: string): Promise<any>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    getBalance(address?: string): Promise<number>;
    getWalletInfo(): Promise<WalletInfo>;
}
