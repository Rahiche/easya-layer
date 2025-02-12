"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBlockchainSDK = void 0;
const XRPLUtils_1 = require("./providers/xrpl/XRPLUtils");
class BaseBlockchainSDK {
    constructor(config, provider) {
        this.config = config;
        this.provider = provider;
        this.isConnected = false;
        this.currentAddress = null;
    }
    ensureConnected() {
        if (!this.isConnected) {
            throw new Error('Not connected to network');
        }
    }
    async getTargetAddress(address) {
        const targetAddress = address || this.currentAddress;
        if (!targetAddress) {
            throw new Error('No address provided and no cached address available');
        }
        return targetAddress;
    }
    validateTransactionConfig(config) {
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
    validateNFTConfig(config) {
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
    validateTransferNFTParams(tokenId, to) {
        if (!(tokenId === null || tokenId === void 0 ? void 0 : tokenId.trim())) {
            throw new Error('Valid token ID is required');
        }
        if (!(to === null || to === void 0 ? void 0 : to.trim())) {
            throw new Error('Valid recipient address is required');
        }
        this.validateAddressFormat(to);
    }
    validateAddressFormat(address) {
        switch (this.config.blockchain.toLowerCase()) {
            case 'xrpl':
                if (!address.startsWith('r') || address.length !== 34) {
                    throw new Error('Invalid XRPL address format');
                }
                break;
            // Add other blockchain-specific validations here
        }
    }
    handleError(operation, error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error in ${operation}:`, errorMessage);
        throw new Error(`Failed to ${operation}: ${errorMessage}`);
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
    async createTrustLine(config) {
        try {
            this.ensureConnected();
            (0, XRPLUtils_1.validateTrustLineConfig)(config);
            return await this.provider.createTrustLine(config);
        }
        catch (error) {
            return this.handleError('create trust line', error);
        }
    }
    async sendCurrency(config) {
        try {
            this.ensureConnected();
            (0, XRPLUtils_1.validateCurrencyTransactionConfig)(config);
            // Convert amount to proper format if needed
            const formattedConfig = {
                ...config,
                amount: (0, XRPLUtils_1.formatCurrencyAmount)(config.amount)
            };
            return await this.provider.sendCurrency(formattedConfig);
        }
        catch (error) {
            return this.handleError('send currency', error);
        }
    }
}
exports.BaseBlockchainSDK = BaseBlockchainSDK;
