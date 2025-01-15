export type BlockchainNetwork = 'mainnet' | 'testnet';

export type BlockchainPlatform =
  | 'xrpl'
  | 'aptos';

export interface EasyaConfig {
  network: BlockchainNetwork;
  blockchain: BlockchainPlatform;
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
  //confirmations?: number;
  //timestamp?: number;
  //details?: Record<string, any>;
}

export interface BlockchainProvider {
  utils: any;

  // Connection Management
  connect(config?: ConnectionConfig): Promise<string>;
  disconnect(): Promise<void>;
  connectToWallet(): Promise<WalletInfo>;
  isWalletInstalled(): Promise<boolean>;
  establishConnection(): Promise<any>;

  // Basic Operations
  getBalance(address?: string): Promise<number>;
  getTransactionStatus(hash: string): Promise<TransactionResult>;
  getWalletInfo(): Promise<WalletInfo>;

  // Transaction Operations
  sendTransaction(config: TransactionConfig): Promise<TransactionResult>;
  estimateFee(config: TransactionConfig): Promise<string>;
  validateAddress(address: string): boolean;

  // Token Operations
  mintToken(config: TokenConfig): Promise<TransactionResult>;
  transferToken(config: TransactionConfig): Promise<TransactionResult>;
  getTokenBalance(tokenId: string, address?: string): Promise<string>;

  // NFT Operations
  mintNFT(config: NFTConfig): Promise<TransactionResult>;
  transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
  getNFTBalance(address?: string): Promise<Array<string>>;
  getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
  getNFTs(address?: string): Promise<Array<NFT>>;

  // Network Operations
  getNetwork(): string;
  isConnected(): boolean;
  getBlockHeight(): Promise<number>;

  // Utility Methods
  sign(message: string): Promise<string>;
  verify(message: string, signature: string, address: string): Promise<boolean>;

  // Event Handling
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