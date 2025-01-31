import { XRPLUtils } from "../providers/xrpl/XRPLUtils";

export type BlockchainNetwork = 'mainnet' | 'testnet';

export type BlockchainPlatform =
    | 'xrpl'
    | 'aptos';


export type SupportedWallet =
    | 'crossmark'
    | 'gem';

export interface EasyaConfig {
    network: BlockchainNetwork;
    blockchain: BlockchainPlatform;
    wallet: SupportedWallet;
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

export interface TrustLineConfig {
    currency: string;
    issuer: string;
    limit?: string;
}
export interface CurrencyTransactionConfig {
    currency: string;
    amount: string;
    destination: string;
    issuer: string;
}


export interface TokenConfig {
    currency: string;           // The currency code for the token
    amount: string;            // Amount to issue
    destination: string;       // Destination address
    issuer: string;           // Cold wallet/issuer address
    destinationTag?: number;   // Optional destination tag
    transferRate?: number;     // Optional transfer fee (0-1000 for 0-1%)
    limit?: string;           // Trust line limit (optional)
}

export interface TokenIssuanceResult {
    trustLineHash?: string;    // Hash of the trust line transaction
    issuanceHash: string;      // Hash of the issuance transaction
    amount: string;            // Amount issued
    currency: string;          // Currency code
}


export interface Balance {
    currency: string;
    value: string;
    issuer?: string;
}


export interface BlockchainProvider {
    xrplUtils():XRPLUtils;

    // Connection Management
    connect(config?: ConnectionConfig): Promise<string>;
    disconnect(): Promise<void>;
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
    createTrustLine(config: TrustLineConfig): Promise<TransactionResult>;
    sendCurrency(config: CurrencyTransactionConfig): Promise<TransactionResult>;
    getBalances(address?: string): Promise<Balance[]>;

    // NFT Operations
    mintNFT(config: NFTConfig): Promise<TransactionResult>;
    transferNFT(tokenId: string, to: string): Promise<TransactionResult>;
    getNFTMetadata(tokenId: string): Promise<Record<string, any>>;
    getNFTs(address?: string): Promise<Array<NFT>>;
    issueFungibleToken(config: TokenConfig): Promise<TokenIssuanceResult>;

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

export interface WalletAdapter {
    isInstalled(): Promise<boolean>;
    connect(): Promise<WalletInfo>;
    sign(message: string): Promise<string>;
    signAndSubmit(transaction: any): Promise<any>;
    disconnect(): Promise<void>;
}



export class BlockchainEvent {
    public readonly timestamp: number;
    public readonly network: string;

    constructor(
        public readonly type: string,
        public readonly data: any,
        network?: string,
        timestamp?: number
    ) {
        this.timestamp = timestamp || Date.now();
        this.network = network || 'unknown';
    }

    // Factory methods for common event types
    static createLedgerEvent(
        network: string,
        ledgerIndex: number,
        ledgerHash: string,
        totalTransactions: number,
        closeTime: number
    ): BlockchainEvent {
        return new BlockchainEvent('ledger', {
            ledgerIndex,
            ledgerHash,
            totalTransactions,
            closeTime
        }, network);
    }

    static createTransactionEvent(
        network: string,
        hash: string,
        from: string,
        to: string,
        amount?: string,
        status: 'pending' | 'confirmed' | 'failed' = 'pending',
        confirmations?: number
    ): BlockchainEvent {
        return new BlockchainEvent('transaction', {
            hash,
            from,
            to,
            amount,
            status,
            confirmations
        }, network);
    }

    static createNFTEvent(
        network: string,
        action: 'mint' | 'transfer' | 'burn' | 'list' | 'unlist' | 'sale',
        tokenId: string,
        from: string,
        to?: string,
        price?: string
    ): BlockchainEvent {
        return new BlockchainEvent('nft', {
            action,
            tokenId,
            from,
            to,
            price
        }, network);
    }

    static createWalletEvent(
        network: string,
        action: 'connect' | 'disconnect' | 'network_change' | 'account_change',
        address?: string
    ): BlockchainEvent {
        return new BlockchainEvent('wallet', {
            action,
            address
        }, network);
    }

    static createErrorEvent(
        network: string,
        code: string,
        message: string,
        originalError?: any
    ): BlockchainEvent {
        return new BlockchainEvent('error', {
            code,
            message,
            originalError
        }, network);
    }

    // Helper methods
    hasData(key: string): boolean {
        return this.data && key in this.data;
    }

    getData<T>(key: string, defaultValue?: T): T | undefined {
        return this.data && key in this.data ? this.data[key] : defaultValue;
    }

    // Type guard methods
    isLedgerEvent(): boolean {
        return this.type === 'ledger';
    }

    isTransactionEvent(): boolean {
        return this.type === 'transaction';
    }

    isNFTEvent(): boolean {
        return this.type === 'nft';
    }

    isWalletEvent(): boolean {
        return this.type === 'wallet';
    }

    isErrorEvent(): boolean {
        return this.type === 'error';
    }
}

export class EventCallback {
    private readonly callback: (event: BlockchainEvent) => void | Promise<void>;
    private readonly filters: Map<string, (event: BlockchainEvent) => boolean>;
    private debounceTimeout?: NodeJS.Timeout;
    private readonly options: {
        debounceMs?: number;
        batchSize?: number;
        retryOnError?: boolean;
        maxRetries?: number;
    };

    constructor(
        callback: (event: BlockchainEvent) => void | Promise<void>,
        options: {
            debounceMs?: number;
            batchSize?: number;
            retryOnError?: boolean;
            maxRetries?: number;
        } = {}
    ) {
        this.callback = callback;
        this.filters = new Map();
        this.options = options;
    }

    // Add filters
    addFilter(name: string, filterFn: (event: BlockchainEvent) => boolean): this {
        this.filters.set(name, filterFn);
        return this;
    }

    // Remove filters
    removeFilter(name: string): this {
        this.filters.delete(name);
        return this;
    }

    // Common filter factories
    static createTypeFilter(types: string[]): (event: BlockchainEvent) => boolean {
        return (event: BlockchainEvent) => types.includes(event.type);
    }

    static createAddressFilter(addresses: string[]): (event: BlockchainEvent) => boolean {
        const lowerAddresses = addresses.map(addr => addr.toLowerCase());
        return (event: BlockchainEvent) => {
            if (event.hasData('from')) {
                const from = event.getData<string>('from')?.toLowerCase();
                if (from && lowerAddresses.includes(from)) return true;
            }
            if (event.hasData('to')) {
                const to = event.getData<string>('to')?.toLowerCase();
                if (to && lowerAddresses.includes(to)) return true;
            }
            return false;
        };
    }

    // Handle event with all filters and options applied
    async handleEvent(event: BlockchainEvent): Promise<void> {
        // Check if event passes all filters
        for (const filter of this.filters.values()) {
            if (!filter(event)) return;
        }

        // Apply debouncing if configured
        if (this.options.debounceMs) {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = setTimeout(() => {
                this.executeCallback(event);
            }, this.options.debounceMs);
            return;
        }

        await this.executeCallback(event);
    }

    // Execute the callback with retry logic
    private async executeCallback(event: BlockchainEvent): Promise<void> {
        let retries = 0;
        const maxRetries = this.options.maxRetries || 3;

        while (true) {
            try {
                await Promise.resolve(this.callback(event));
                break;
            } catch (error) {
                if (!this.options.retryOnError || retries >= maxRetries) {
                    throw error;
                }
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }

    // Clean up any pending timeouts
    cleanup(): void {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
}