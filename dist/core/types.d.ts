export type BlockchainNetwork = 'mainnet' | 'testnet';
export type BlockchainPlatform = 'xrpl' | 'aptos';
export type SupportedWallet = 'crossmark' | 'gem';
export interface EasyaConfig {
    network: BlockchainNetwork;
    blockchain: BlockchainPlatform;
    wallet: SupportedWallet;
}
export interface TokenConfig {
    currency: string;
    value: string;
    issuer: string;
    limit?: string;
}
export interface NFTConfig {
    URI: string;
    name: string;
    description: string;
    image: string;
    flags?: number;
    transferFee?: number;
    taxon: number;
}
export interface TransactionConfig {
    to: string;
    amount: string;
    options?: Record<string, any>;
}
export interface ConnectionConfig {
    network?: string;
    customEndpoint?: string;
    options?: Record<string, any>;
}
export interface WalletInfo {
    address: string;
    publicKey: string;
    balance?: string;
    network?: string;
}
export interface TransactionResult {
    hash: string;
    status?: string;
    nftID?: string;
}
export interface BlockchainProvider {
    utils: any;
    connect(config?: ConnectionConfig): Promise<string>;
    disconnect(): Promise<void>;
    isWalletInstalled(): Promise<boolean>;
    establishConnection(): Promise<any>;
    getBalance(address?: string): Promise<number>;
    getTransactionStatus(hash: string): Promise<TransactionResult>;
    getWalletInfo(): Promise<WalletInfo>;
    sendTransaction(config: TransactionConfig): Promise<TransactionResult>;
    estimateFee(config: TransactionConfig): Promise<string>;
    validateAddress(address: string): boolean;
    mintToken(config: TokenConfig): Promise<TransactionResult>;
    transferToken(config: TransactionConfig): Promise<TransactionResult>;
    getTokenBalance(tokenId: string, address?: string): Promise<string>;
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
    getNFTs(address?: string): Promise<Array<NFT>>;
    getNetwork(): string;
    isConnected(): boolean;
    getBlockHeight(): Promise<number>;
    sign(message: string): Promise<string>;
    verify(message: string, signature: string, address: string): Promise<boolean>;
    subscribeToEvents(eventName: string, callback: (data: any) => void): void;
    unsubscribeFromEvents(eventName: string): void;
}
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
}
export interface TokenMetadata {
    name: string;
    symbol: string;
    decimals?: number;
    initialSupply: number;
}
export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes?: Record<string, any>;
}
export interface TransactionOptions {
    maxLedgerVersionOffset?: number;
    fee?: string;
}
export interface NFT {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    owner: string;
    price?: string;
}
export interface WalletAdapter {
    isInstalled(): Promise<boolean>;
    connect(): Promise<WalletInfo>;
    sign(message: string): Promise<string>;
    signAndSubmit(transaction: any): Promise<any>;
    disconnect(): Promise<void>;
}
export declare class BlockchainEvent {
    readonly type: string;
    readonly data: any;
    readonly timestamp: number;
    readonly network: string;
    constructor(type: string, data: any, network?: string, timestamp?: number);
    static createLedgerEvent(network: string, ledgerIndex: number, ledgerHash: string, totalTransactions: number, closeTime: number): BlockchainEvent;
    static createTransactionEvent(network: string, hash: string, from: string, to: string, amount?: string, status?: 'pending' | 'confirmed' | 'failed', confirmations?: number): BlockchainEvent;
    static createNFTEvent(network: string, action: 'mint' | 'transfer' | 'burn' | 'list' | 'unlist' | 'sale', tokenId: string, from: string, to?: string, price?: string): BlockchainEvent;
    static createWalletEvent(network: string, action: 'connect' | 'disconnect' | 'network_change' | 'account_change', address?: string): BlockchainEvent;
    static createErrorEvent(network: string, code: string, message: string, originalError?: any): BlockchainEvent;
    hasData(key: string): boolean;
    getData<T>(key: string, defaultValue?: T): T | undefined;
    isLedgerEvent(): boolean;
    isTransactionEvent(): boolean;
    isNFTEvent(): boolean;
    isWalletEvent(): boolean;
    isErrorEvent(): boolean;
}
export declare class EventCallback {
    private readonly callback;
    private readonly filters;
    private debounceTimeout?;
    private readonly options;
    constructor(callback: (event: BlockchainEvent) => void | Promise<void>, options?: {
        debounceMs?: number;
        batchSize?: number;
        retryOnError?: boolean;
        maxRetries?: number;
    });
    addFilter(name: string, filterFn: (event: BlockchainEvent) => boolean): this;
    removeFilter(name: string): this;
    static createTypeFilter(types: string[]): (event: BlockchainEvent) => boolean;
    static createAddressFilter(addresses: string[]): (event: BlockchainEvent) => boolean;
    handleEvent(event: BlockchainEvent): Promise<void>;
    private executeCallback;
    cleanup(): void;
}
