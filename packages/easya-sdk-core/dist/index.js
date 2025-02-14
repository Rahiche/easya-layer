"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyaSDK = void 0;
const BaseBlockchainSDK_1 = require("./BaseBlockchainSDK");
const provider_factory_1 = require("./providers/provider.factory");
class EasyaSDK extends BaseBlockchainSDK_1.BaseBlockchainSDK {
    constructor(config) {
        const provider = provider_factory_1.ProviderFactory.createProvider(config.blockchain, config.network, config.wallet);
        super(config, provider);
        this.eventCallbacks = new Map();
    }
    async connect() {
        try {
            const result = await this.provider.connect();
            this.isConnected = true;
            try {
                const walletInfo = await this.provider.getWalletInfo();
                this.currentAddress = walletInfo.address;
            }
            catch (error) {
                console.warn('Failed to fetch wallet address during connection:', error);
            }
            return result;
        }
        catch (error) {
            return this.handleError('connect', error);
        }
    }
    async disconnect() {
        try {
            this.ensureConnected();
            await this.provider.disconnect();
            this.isConnected = false;
            this.currentAddress = null;
        }
        catch (error) {
            this.handleError('disconnect', error);
        }
    }
    isActive() {
        return this.isConnected;
    }
    async sendTransaction(config) {
        try {
            this.ensureConnected();
            // If currency is specified and it's not the native currency (e.g., XRP)
            if (config.currency && config.currency !== 'XRP') {
                if (!config.issuer) {
                    throw new Error('Issuer is required for non-XRP currency transactions');
                }
                // Check if recipient has a trust line for this currency
                const hasTrustLine = await this.provider.xrplUtils().checkTrustLine(config.to, config.currency, config.issuer);
                if (!hasTrustLine) {
                    throw new Error(`Recipient ${config.to} does not have a trust line for ${config.currency}. They must add a trust line for ${config.currency} from issuer ${config.issuer} before receiving the token.`);
                }
                const currencyConfig = {
                    currency: config.currency,
                    amount: config.amount,
                    destination: config.to,
                    issuer: config.issuer
                };
                return await this.provider.sendCurrency(currencyConfig);
            }
            const amountInDrops = parseFloat(config.amount).toString();
            return await this.provider.sendTransaction({
                ...config,
                amount: amountInDrops
            });
        }
        catch (error) {
            return this.handleError('send transaction', error);
        }
    }
    async mintNFT(config) {
        try {
            this.ensureConnected();
            this.validateNFTConfig(config);
            return await this.provider.mintNFT(config);
        }
        catch (error) {
            return this.handleError('mint NFT', error);
        }
    }
    async issueToken(config) {
        try {
            this.ensureConnected();
            return await this.provider.issueToken(config);
        }
        catch (error) {
            return this.handleError('issue NFT', error);
        }
    }
    async getBalances() {
        try {
            this.ensureConnected();
            return await this.provider.getBalances();
        }
        catch (error) {
            return this.handleError('get Balances', error);
        }
    }
    async getBalance(address) {
        try {
            this.ensureConnected();
            const targetAddress = await this.getTargetAddress(address);
            return await this.provider.getBalance(targetAddress);
        }
        catch (error) {
            return this.handleError('get balance', error);
        }
    }
    async getAddress() {
        try {
            this.ensureConnected();
            if (this.currentAddress) {
                return this.currentAddress;
            }
            const walletInfo = await this.provider.getWalletInfo();
            this.currentAddress = walletInfo.address;
            return this.currentAddress;
        }
        catch (error) {
            return this.handleError('get address', error);
        }
    }
    async getNFTs(address) {
        try {
            this.ensureConnected();
            const targetAddress = await this.getTargetAddress(address);
            const nfts = await this.provider.getNFTs(targetAddress);
            return nfts.map(nft => ({
                ...nft,
                price: nft.price ? `${nft.price} ${this.getCurrencySymbol()}` : 'Not for sale'
            }));
        }
        catch (error) {
            return this.handleError('fetch NFTs', error);
        }
    }
    async transferNFT(tokenId, to) {
        try {
            this.ensureConnected();
            this.validateTransferNFTParams(tokenId, to);
            return await this.provider.transferNFT(tokenId, to);
        }
        catch (error) {
            return this.handleError('transfer NFT', error);
        }
    }
    async isWalletInstalled() {
        try {
            return await this.provider.isWalletInstalled();
        }
        catch (error) {
            console.warn('Error checking wallet installation:', error);
            return false;
        }
    }
    getBlockchain() {
        return this.config.blockchain;
    }
    getCurrencySymbol() {
        switch (this.config.blockchain.toLowerCase()) {
            case 'xrpl':
                return 'XRP';
            case 'aptos':
                return 'APT';
            default:
                throw new Error(`Unsupported blockchain: ${this.config.blockchain}`);
        }
    }
    async subscribeToEvents(eventName, callback) {
        try {
            this.ensureConnected();
            // Store callback for cleanup during unsubscribe
            this.eventCallbacks.set(eventName, callback);
            // Forward the subscription to the provider
            await this.provider.subscribeToEvents(eventName, callback);
        }
        catch (error) {
            this.handleError('subscribe to events', error);
        }
    }
    async unsubscribeFromEvents(eventName) {
        try {
            this.ensureConnected();
            // Check if we have an active subscription
            if (!this.eventCallbacks.has(eventName)) {
                console.warn(`No active subscription found for event: ${eventName}`);
                return;
            }
            // Forward the unsubscribe request to the provider
            await this.provider.unsubscribeFromEvents(eventName);
            // Clean up the stored callback
            this.eventCallbacks.delete(eventName);
        }
        catch (error) {
            this.handleError('unsubscribe from events', error);
        }
    }
    handleError(operation, error) {
        const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || String(error);
        throw new Error(`Failed to ${operation}: ${errorMessage}`);
    }
}
exports.EasyaSDK = EasyaSDK;
