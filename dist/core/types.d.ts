export interface EasyaConfig {
    network: 'mainnet' | 'testnet';
    blockchain: string;
    provider?: string;
}
export interface TokenConfig {
    currency: string;
    value: string;
    issuer: string;
    limit?: string;
}
export interface NFTConfig {
    URI: string;
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
}
export interface BlockchainProvider {
    connect(config?: ConnectionConfig): Promise<string>;
    disconnect(): Promise<void>;
    connectToWallet(): Promise<WalletInfo>;
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
    getNFTBalance(address?: string): Promise<Array<string>>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
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
