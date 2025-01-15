"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyaSDK = void 0;
const provider_factory_1 = require("./providers/provider.factory");
class EasyaSDK {
    constructor() {
        this.isConnected = false;
        this.config = {
            network: 'testnet',
            blockchain: 'xrpl',
        };
        this.provider = provider_factory_1.ProviderFactory.createProvider(this.config.blockchain, this.config.network);
    }
    async connect() {
        try {
            const result = await this.provider.connect();
            this.isConnected = true;
            return result;
        }
        catch (error) {
            throw new Error(`Failed to connect: ${error}`);
        }
    }
    async disconnect() {
        try {
            if (!this.isConnected) {
                throw new Error('Not connected');
            }
            await this.provider.disconnect();
            this.isConnected = false;
        }
        catch (error) {
            throw new Error(`Failed to disconnect: ${error}`);
        }
    }
    isActive() {
        return this.isConnected;
    }
    /**
     * Sends a transaction using the configured blockchain provider
     * @param config Transaction configuration parameters
     * @returns Promise containing the transaction result
     * @throws Error if not connected or if transaction fails
     */
    async sendTransaction(config) {
        try {
            if (!this.isConnected) {
                throw new Error('Not connected to network');
            }
            // Validate transaction config
            this.validateTransactionConfig(config);
            // Convert amount to drops (1 XRP = 1,000,000 drops)
            const amountInDrops = (parseFloat(config.amount) * 1000000).toString();
            const transactionConfig = {
                ...config,
                amount: amountInDrops
            };
            // Call provider's sendTransaction method
            const result = await this.provider.sendTransaction(transactionConfig);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to send transaction: ${error}`);
        }
    }
    /**
     * Validates transaction configuration parameters
     * @param config Transaction configuration to validate
     * @throws Error if config is invalid
     */
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
        // Additional XRPL-specific validations could be added here
        // For example, checking address format, minimum transaction amount, etc.
    }
    /**
     * Mints a new NFT using the configured blockchain provider
     * @param config NFT configuration parameters
     * @returns Promise containing the transaction result
     * @throws Error if not connected or if minting fails
     */
    async mintNFT(config) {
        try {
            if (!this.isConnected) {
                throw new Error('Not connected to network');
            }
            // Validate NFT config
            this.validateNFTConfig(config);
            // Call provider's mintNFT method
            const result = await this.provider.mintNFT(config);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to mint NFT: ${error}`);
        }
    }
    /**
     * Validates NFT configuration parameters
     * @param config NFT configuration to validate
     * @throws Error if config is invalid
     */
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
    /**
   * Gets the balance for a given address or the connected wallet
   * @param address Optional address to check balance for
   * @returns Promise containing the balance as a string
   * @throws Error if not connected or if balance check fails
   */
    async getBalance(address) {
        try {
            if (!this.isConnected) {
                throw new Error('Not connected to network');
            }
            const balance = await this.provider.getBalance(address);
            return balance;
        }
        catch (error) {
            throw new Error(`Failed to get balance: ${error}`);
        }
    }
    getCurrencySymbol() {
        switch (this.config.blockchain.toLowerCase()) {
            case 'xrpl':
                return 'XRP';
            default:
                throw new Error(`Unsupported blockchain: ${this.config.blockchain}`);
        }
    }
}
exports.EasyaSDK = EasyaSDK;
