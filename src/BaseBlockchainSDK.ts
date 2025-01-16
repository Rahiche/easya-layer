import { BlockchainProvider, EasyaConfig, NFTConfig, TransactionConfig } from './core/types';

export abstract class BaseBlockchainSDK {
    protected isConnected: boolean = false;
    protected currentAddress: string | null = null;
    
    constructor(
        protected readonly config: EasyaConfig,
        protected readonly provider: BlockchainProvider
    ) {}

    protected ensureConnected() {
        if (!this.isConnected) {
            throw new Error('Not connected to network');
        }
    }

    protected async getTargetAddress(address?: string): Promise<string> {
        const targetAddress = address || this.currentAddress;
        if (!targetAddress) {
            throw new Error('No address provided and no cached address available');
        }
        return targetAddress;
    }

    protected validateTransactionConfig(config: TransactionConfig) {
        if (!config) {
            throw new Error('Transaction configuration is required');
        }

        if (!config.to) {
            throw new Error('Recipient address is required');
        }

        if (!config.amount || parseFloat(config.amount) <= 0) {
            throw new Error('Valid amount is required');
        }
    }

    protected validateNFTConfig(config: NFTConfig) {
        if (!config) {
            throw new Error('NFT configuration is required');
        }

        if (!config.URI) {
            throw new Error('NFT URI is required');
        }

        if (typeof config.taxon !== 'number') {
            throw new Error('NFT taxon must be a number');
        }

        if (config.transferFee !== undefined &&
            (config.transferFee < 0 || config.transferFee > 50000)) {
            throw new Error('Transfer fee must be between 0 and 50000');
        }
    }

    protected validateTransferNFTParams(tokenId: string, to: string) {
        if (!tokenId?.trim()) {
            throw new Error('Valid token ID is required');
        }

        if (!to?.trim()) {
            throw new Error('Valid recipient address is required');
        }

        this.validateAddressFormat(to);
    }

    protected validateAddressFormat(address: string) {
        switch (this.config.blockchain.toLowerCase()) {
            case 'xrpl':
                if (!address.startsWith('r') || address.length !== 34) {
                    throw new Error('Invalid XRPL address format');
                }
                break;
            // Add other blockchain-specific validations here
        }
    }

    protected handleError(operation: string, error: unknown): never {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error in ${operation}:`, errorMessage);
        throw new Error(`Failed to ${operation}: ${errorMessage}`);
    }

    protected getCurrencySymbol(): string {
        switch (this.config.blockchain.toLowerCase()) {
            case 'xrpl':
                return 'XRP';
            case 'aptos':
                return 'APT';
            default:
                throw new Error(`Unsupported blockchain: ${this.config.blockchain}`);
        }
    }
}