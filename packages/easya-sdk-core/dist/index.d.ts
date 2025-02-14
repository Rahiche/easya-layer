import { Client } from 'xrpl';

declare class XRPLUtils {
    private client;
    constructor(client: Client);
    stringToHex(str: string): string;
    hexToString(hex: string): string;
    dropsToXRP(drops: string): string;
    xrpToDrops(xrp: string): string;
    fetchNFTMetadata(uri: string): Promise<any>;
    checkTrustLine(address: string, currency: string, issuer: string): Promise<boolean>;
}

type BlockchainNetwork = 'mainnet' | 'testnet';
type BlockchainPlatform = 'xrpl' | 'aptos';
type SupportedWallet = 'crossmark' | 'gem';
interface EasyaConfig {
    network: BlockchainNetwork;
    blockchain: BlockchainPlatform;
    wallet: SupportedWallet;
}
interface NFTConfig {
    URI: string;
    name: string;
    description: string;
    image: string;
    flags?: number;
    transferFee?: number;
    taxon: number;
}
interface TransactionConfig {
    to: string;
    amount: string;
    options?: Record<string, any>;
}
interface ConnectionConfig {
    network?: string;
    customEndpoint?: string;
    options?: Record<string, any>;
}
interface WalletInfo {
    address: string;
    publicKey: string;
    balance?: string;
    network?: string;
}
interface TransactionResult {
    hash: string;
    status?: string;
    nftID?: string;
}
interface TrustLineConfig {
    currency: string;
    issuer: string;
    limit?: string;
}
interface CurrencyTransactionConfig {
    currency: string;
    amount: string;
    destination: string;
    issuer: string;
}
interface TokenConfig {
    currency: string;
    amount: string;
    destination: string;
    issuer: string;
    destinationTag?: number;
    transferRate?: number;
    limit?: string;
}
interface TokenIssuanceResult {
    trustLineHash?: string;
    issuanceHash: string;
    amount: string;
    currency: string;
}
interface Balance {
    currency: string;
    value: string;
    issuer?: string;
    nonStandard?: string;
}
interface TokenIssuanceData {
    currencyCode: string;
    amount: string;
    transferRate: number;
    tickSize: number;
    domain: string;
    requireDestTag: boolean;
    disallowXRP: boolean;
}
interface BlockchainProvider {
    xrplUtils(): XRPLUtils;
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
    createTrustLine(config: TrustLineConfig): Promise<TransactionResult>;
    sendCurrency(config: CurrencyTransactionConfig): Promise<TransactionResult>;
    getBalances(address?: string): Promise<Balance[]>;
    issueToken(config: TokenIssuanceData): Promise<TransactionResult>;
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
    getNFTs(address?: string): Promise<Array<NFT>>;
    issueFungibleToken(config: TokenConfig): Promise<TokenIssuanceResult>;
    getNetwork(): string;
    isConnected(): boolean;
    getBlockHeight(): Promise<number>;
    sign(message: string): Promise<string>;
    verify(message: string, signature: string, address: string): Promise<boolean>;
    subscribeToEvents(eventName: string, callback: (data: any) => void): void;
    unsubscribeFromEvents(eventName: string): void;
}
interface NFT {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    owner: string;
    price?: string;
}

declare abstract class BaseBlockchainSDK {
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

declare class EasyaSDK extends BaseBlockchainSDK {
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

export { EasyaSDK };
