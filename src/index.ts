// easya-sdk.ts
import { BaseBlockchainSDK } from './BaseBlockchainSDK';
import { EasyaConfig, NFT, NFTConfig, TransactionConfig, TransactionResult } from './core/types';
import { ProviderFactory } from './providers/provider.factory';

export class EasyaSDK extends BaseBlockchainSDK {
    constructor(config: EasyaConfig) {
        const provider = ProviderFactory.createProvider(
            config.blockchain,
            config.network,
            config.wallet
        );
        super(config, provider);
    }

    async connect(): Promise<string> {
        try {
            const result = await this.provider.connect();
            this.isConnected = true;

            try {
                const walletInfo = await this.provider.getWalletInfo();
                this.currentAddress = walletInfo.address;
            } catch (error) {
                console.warn('Failed to fetch wallet address during connection:', error);
            }

            return result;
        } catch (error) {
            return this.handleError('connect', error);
        }
    }

    async disconnect(): Promise<void> {
        try {
            this.ensureConnected();
            await this.provider.disconnect();
            this.isConnected = false;
            this.currentAddress = null;
        } catch (error) {
            this.handleError('disconnect', error);
        }
    }

    isActive(): boolean {
        return this.isConnected;
    }

    async sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
        try {
            this.ensureConnected();
            this.validateTransactionConfig(config);

            const amountInDrops = parseFloat(config.amount).toString();
            return await this.provider.sendTransaction({
                ...config,
                amount: amountInDrops
            });
        } catch (error) {
            return this.handleError('send transaction', error);
        }
    }

    async mintNFT(config: NFTConfig): Promise<TransactionResult> {
        try {
            this.ensureConnected();
            this.validateNFTConfig(config);
            return await this.provider.mintNFT(config);
        } catch (error) {
            return this.handleError('mint NFT', error);
        }
    }

    async getBalance(address?: string): Promise<number> {
        try {
            this.ensureConnected();
            const targetAddress = await this.getTargetAddress(address);
            return await this.provider.getBalance(targetAddress);
        } catch (error) {
            return this.handleError('get balance', error);
        }
    }

    async getAddress(): Promise<string> {
        try {
            this.ensureConnected();
            
            if (this.currentAddress) {
                return this.currentAddress;
            }

            const walletInfo = await this.provider.getWalletInfo();
            this.currentAddress = walletInfo.address;
            return this.currentAddress;
        } catch (error) {
            return this.handleError('get address', error);
        }
    }

    async getNFTs(address?: string): Promise<NFT[]> {
        try {
            this.ensureConnected();
            const targetAddress = await this.getTargetAddress(address);
            const nfts = await this.provider.getNFTs(targetAddress);
            
            return nfts.map(nft => ({
                ...nft,
                price: nft.price ? `${nft.price} ${this.getCurrencySymbol()}` : 'Not for sale'
            }));
        } catch (error) {
            return this.handleError('fetch NFTs', error);
        }
    }

    async transferNFT(tokenId: string, to: string): Promise<TransactionResult> {
        try {
            this.ensureConnected();
            this.validateTransferNFTParams(tokenId, to);
            return await this.provider.transferNFT(tokenId, to);
        } catch (error) {
            return this.handleError('transfer NFT', error);
        }
    }

    async isWalletInstalled(): Promise<boolean> {
        try {
            return await this.provider.isWalletInstalled();
        } catch (error) {
            console.warn('Error checking wallet installation:', error);
            return false;
        }
    }
}