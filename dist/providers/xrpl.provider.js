"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRPLProvider = void 0;
const xrpl_1 = require("xrpl");
const sdk_1 = __importDefault(require("@crossmarkio/sdk"));
class XRPLProvider {
    constructor(network = 'mainnet') {
        this.network = network;
    }
    async getBalance(address) {
        var _a, _b;
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            // Use provided address or default to connected wallet's address
            const targetAddress = address || ((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            // Request account info from XRPL
            const response = await this.connection.request({
                command: 'account_info',
                account: targetAddress,
                ledger_index: 'validated'
            });
            // Convert balance from drops to XRP and return as string
            const balanceInDrops = response.result.account_data.Balance;
            // Convert balance from string to number using dropsToXrp
            const balanceInXRP = Number(balanceInDrops);
            return balanceInXRP;
        }
        catch (error) {
            // Handle specific XRPL errors
            if (((_b = error.data) === null || _b === void 0 ? void 0 : _b.error) === 'actNotFound') {
                return 0; // Return 0 balance for non-existent accounts
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }
    getTransactionStatus(hash) {
        throw new Error("Method not implemented.");
    }
    getWalletInfo() {
        throw new Error("Method not implemented.");
    }
    estimateFee(config) {
        throw new Error("Method not implemented.");
    }
    validateAddress(address) {
        throw new Error("Method not implemented.");
    }
    transferToken(config) {
        throw new Error("Method not implemented.");
    }
    getTokenBalance(tokenId, address) {
        throw new Error("Method not implemented.");
    }
    transferNFT(tokenId, to) {
        throw new Error("Method not implemented.");
    }
    getNFTBalance(address) {
        throw new Error("Method not implemented.");
    }
    getNFTMetadata(tokenId) {
        throw new Error("Method not implemented.");
    }
    isConnected() {
        throw new Error("Method not implemented.");
    }
    getBlockHeight() {
        throw new Error("Method not implemented.");
    }
    sign(message) {
        throw new Error("Method not implemented.");
    }
    verify(message, signature, address) {
        throw new Error("Method not implemented.");
    }
    subscribeToEvents(eventName, callback) {
        throw new Error("Method not implemented.");
    }
    unsubscribeFromEvents(eventName) {
        throw new Error("Method not implemented.");
    }
    async connect() {
        try {
            // Connect to wallet first
            this.wallet = await this.connectToWallet();
            // Then establish XRPL connection
            this.connection = await this.establishConnection();
            // Return the connected wallet address
            return this.wallet.address;
        }
        catch (error) {
            throw new Error(`Failed to connect to XRPL: ${error}`);
        }
    }
    async connectToWallet() {
        try {
            // Check if Crossmark is installed
            const isInstalled = sdk_1.default.sync.isInstalled();
            if (!isInstalled) {
                throw new Error('Crossmark wallet is not installed');
            }
            // Request wallet connection
            let { request, response, createdAt, resolvedAt } = await sdk_1.default.methods.signInAndWait();
            // Verify connection and return wallet info
            if (!response || !response.data.address) {
                throw new Error('Failed to connect to Crossmark wallet');
            }
            return {
                address: response.data.address,
                publicKey: response.data.publicKey
            };
        }
        catch (error) {
            throw new Error(`Wallet connection failed: ${error}`);
        }
    }
    async establishConnection() {
        try {
            // Get network URL
            const networkUrl = XRPLProvider.NETWORKS[this.network];
            if (!networkUrl) {
                throw new Error(`Invalid network: ${this.network}`);
            }
            // Create and connect XRPL client
            const client = new xrpl_1.Client(networkUrl);
            await client.connect();
            return client;
        }
        catch (error) {
            throw new Error(`XRPL connection failed: ${error}`);
        }
    }
    async disconnect() {
        var _a;
        try {
            if ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.isConnected()) {
                await this.connection.disconnect();
            }
            // Reset wallet state
            this.wallet = null;
        }
        catch (error) {
            throw new Error(`Disconnect failed: ${error}`);
        }
    }
    /**
    * Send a transaction on XRPL
    * @param destination Destination address
    * @param amount Amount to send (in drops)
    * @param options Additional transaction options
    */
    async sendTransaction(config) {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            // Prepare the payment transaction
            const payment = {
                TransactionType: "Payment",
                Account: this.wallet.address,
                Destination: config.to,
                Amount: config.amount.toString(),
            };
            // Autofill fields like Fee, Sequence, and LastLedgerSequence
            const prepared = await this.connection.autofill(payment);
            // Sign and submit the transaction using Crossmark wallet
            const { request, response } = await sdk_1.default.methods.signAndSubmitAndWait(prepared);
            if (!response || !response.data) {
                throw new Error('Transaction signing or submission failed');
            }
            // Return the transaction hash
            return {
                hash: response.data.resp.result.hash
            };
        }
        catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }
    /**
        * Mint an NFT on XRPL
        * @param config NFT configuration
        */
    async mintNFT(config) {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            function stringToHex(str) {
                return Array.from(new TextEncoder().encode(str))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            }
            const nftMint = {
                TransactionType: "NFTokenMint",
                Account: this.wallet.address,
                URI: stringToHex(config.URI),
                Flags: config.flags || 0,
                TransferFee: config.transferFee || 0,
                NFTokenTaxon: config.taxon
            };
            const transactionBlob = {
                ...nftMint,
            };
            console.log(`this.wallet ${this.wallet}`);
            // Sign and submit NFTokenMint
            const { response } = await sdk_1.default.methods.signAndSubmitAndWait(transactionBlob, this.wallet);
            if (!response || !response.data) {
                throw new Error('NFT minting failed');
            }
            return {
                hash: response.data.resp.result.hash
            };
        }
        catch (error) {
            throw new Error(`NFT minting failed: ${error}`);
        }
    }
    /**
     * Mint a new token on XRPL
     * @param config Token configuration
     */
    async mintToken(config) {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            // First, set account to allow rippling
            const accountSet = {
                TransactionType: "AccountSet",
                Account: this.wallet.address,
                SetFlag: 8 // Enable rippling
            };
            // Sign and submit AccountSet
            await sdk_1.default.methods.signAndSubmitAndWait({
            // transaction: accountSet
            });
            // Create trust line for the token
            const trustSet = {
                TransactionType: "TrustSet",
                Account: this.wallet.address,
                LimitAmount: {
                    currency: config.currency,
                    issuer: config.issuer,
                    value: config.limit || "1000000000"
                }
            };
            // Sign and submit TrustSet
            const { response } = await sdk_1.default.methods.signAndSubmitAndWait({
            // transaction: trustSet
            });
            if (!response || !response.data) {
                throw new Error('Token minting failed');
            }
            return {
                hash: response.data.resp.result.hash,
            };
        }
        catch (error) {
            throw new Error(`Token minting failed: ${error}`);
        }
    }
    // Getter for the connection
    getConnection() {
        if (!this.connection || !this.connection.isConnected()) {
            throw new Error('Not connected to XRPL');
        }
        return this.connection;
    }
    // Getter for the wallet
    getWallet() {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }
        return this.wallet;
    }
    // Getter for network
    getNetwork() {
        return this.network;
    }
}
exports.XRPLProvider = XRPLProvider;
// Network URLs
XRPLProvider.NETWORKS = {
    mainnet: 'wss://xrplcluster.com',
    testnet: 'wss://s.altnet.rippletest.net:51233',
    devnet: 'wss://s.devnet.rippletest.net:51233'
};
