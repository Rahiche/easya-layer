"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AptosProvider = void 0;
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const AptosUtils_1 = require("./AptosUtils");
class AptosProvider {
    constructor(network = 'testnet') {
        this.utils = AptosUtils_1.aptosUtils;
        this.network = network;
        const nodeUrl = AptosProvider.NETWORKS[this.network];
        if (!nodeUrl) {
            throw new Error(`Invalid network: ${network}`);
        }
        const networkValue = ts_sdk_1.NetworkToNetworkName[network];
        const config = new ts_sdk_1.AptosConfig({ network: networkValue });
        this.aptos = new ts_sdk_1.Aptos(config);
    }
    xrplUtils() {
        throw new Error("Method not implemented.");
    }
    createTrustLine(config) {
        throw new Error("Method not implemented.");
    }
    sendCurrency(config) {
        throw new Error("Method not implemented.");
    }
    getBalances(address) {
        throw new Error("Method not implemented.");
    }
    issueToken(config) {
        throw new Error("Method not implemented.");
    }
    issueFungibleToken(config) {
        throw new Error("Method not implemented.");
    }
    async disconnect() {
        // Return without doing anything as a default implementation
        return;
    }
    async establishConnection() {
        // Return a basic connection status object
        return { status: 'connected', timestamp: Date.now() };
    }
    async getTransactionStatus(hash) {
        // Return a default transaction status
        return {
            hash: hash,
            status: 'unknown'
        };
    }
    async estimateFee(config) {
        // Return a default estimated fee
        return '0.001';
    }
    validateAddress(address) {
        // Basic validation - check if it's a non-empty string
        return typeof address === 'string' && address.length > 0;
    }
    async mintToken(config) {
        // Return a default transaction result
        return {
            hash: '0x' + '0'.repeat(64),
            status: 'success'
        };
    }
    async transferToken(config) {
        // Return a default transaction result
        return {
            hash: '0x' + '0'.repeat(64),
            status: 'success'
        };
    }
    async getTokenBalance(tokenId, address) {
        // Return a default balance of '0'
        return '0';
    }
    async getNFTMetadata(tokenId) {
        // Return default metadata
        return {
            tokenId: tokenId,
            name: 'Unknown Token',
            description: 'Metadata not available'
        };
    }
    async getNFTs(address) {
        // Return empty array as default
        return [];
    }
    getNetwork() {
        // Return the current network
        return this.network;
    }
    isConnected() {
        // Return connection status based on wallet existence
        return !!this.wallet;
    }
    async getBlockHeight() {
        // Return default block height
        return 0;
    }
    async sign(message) {
        // Return a dummy signature
        return '0x' + '0'.repeat(130);
    }
    async verify(message, signature, address) {
        // Return false as default verification result
        return false;
    }
    subscribeToEvents(eventName, callback) {
        // Do nothing as default implementation
    }
    unsubscribeFromEvents(eventName) {
        // Do nothing as default implementation
    }
    // Keep existing implemented methods unchanged
    async isWalletInstalled() {
        return !!window.aptos;
    }
    async connect() {
        try {
            if (!window.aptos) {
                throw new Error('Aptos wallet is not installed');
            }
            const response = await window.aptos.connect();
            const account = await window.aptos.account();
            this.wallet = {
                address: account.address,
                publicKey: account.publicKey
            };
            return this.wallet.address;
        }
        catch (error) {
            throw new Error(`Failed to connect to Aptos: ${error}`);
        }
    }
    async sendTransaction(config) {
        try {
            if (!this.wallet) {
                throw new Error('Not connected to Aptos');
            }
            const transaction = {
                arguments: [config.to, (Number(config.amount) * 100000000).toString()],
                function: '0x1::coin::transfer',
                type: 'entry_function_payload',
                type_arguments: ['0x1::aptos_coin::AptosCoin'],
            };
            const pendingTransaction = await window.aptos.signAndSubmitTransaction(transaction);
            return {
                hash: pendingTransaction.hash
            };
        }
        catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }
    async collectionExists(name) {
        try {
            const collection = await this.aptos.getCollectionData({
                creatorAddress: this.wallet.accountAddress,
                collectionName: name
            });
            return !!collection;
        }
        catch (error) {
            // If collection is not found, the API will throw an error
            return false;
        }
    }
    async mintNFT(config) {
        try {
            if (!this.wallet) {
                throw new Error('Not connected to Aptos');
            }
            console.log('Minting NFT with config:', config);
            // const collectionName = config.taxon.toString();
            const collectionName = "colleciton name";
            const tokenName = config.name || "MyNFT";
            // Check if collection exists
            const hasCollection = await this.collectionExists(collectionName);
            // Create collection if it doesn't exist
            // if (!hasCollection) {
            //     console.log('Creating new collection with name:', collectionName);
            //     const createCollectionTransaction = await this.aptos.createCollectionTransaction({
            //         creator: this.wallet,
            //         description: "Collection Description",
            //         name: collectionName,
            //         uri: "Collection URI"
            //     });
            //     console.log('Collection creation transaction:', createCollectionTransaction);
            //     const collectionTxn = await this.aptos.signAndSubmitTransaction({
            //         signer: this.wallet,
            //         transaction: createCollectionTransaction
            //     });
            //     console.log('Collection creation transaction submitted:', collectionTxn.hash);
            //     await this.aptos.waitForTransaction({
            //         transactionHash: collectionTxn.hash
            //     });
            // } else {
            //     console.log('Using existing collection:', collectionName);
            // }
            // Mint token
            console.log('Creating token with name:', tokenName);
            const mintTokenTransaction = await this.aptos.mintDigitalAssetTransaction({
                creator: this.wallet,
                collection: "MyCollection",
                description: "This is a digital asset.",
                name: "MyDigitalAsset",
                uri: "https://example.com/my-digital-asset",
                // creator: this.wallet,
                // collection: collectionName,
                // description: config.description || "Token Description",
                // name: tokenName,
                // uri: config.URI || "token.uri"
            });
            console.log('Creating token with this.wallet:', this.wallet);
            const tokenTxn = await this.aptos.signAndSubmitTransaction({
                signer: this.wallet,
                transaction: mintTokenTransaction
            });
            console.log('Token creation transaction submitted:', tokenTxn.hash);
            await this.aptos.waitForTransaction({
                transactionHash: tokenTxn.hash
            });
            return {
                hash: tokenTxn.hash,
                // collectionCreated: !hasCollection
            };
        }
        catch (error) {
            console.error('NFT minting failed:', JSON.stringify(error, null, 2));
            throw new Error(`NFT minting failed: ${error}`);
        }
    }
    async getOwnedTokens(address) {
        try {
            const tokens = await this.aptos.getOwnedDigitalAssets({
                ownerAddress: address
            });
            return tokens;
        }
        catch (error) {
            console.error('Failed to fetch owned tokens:', error);
            throw error;
        }
    }
    async getCollectionData(collectionName) {
        try {
            return await this.aptos.getCollectionData({
                creatorAddress: this.wallet.accountAddress,
                collectionName
            });
        }
        catch (error) {
            console.error('Failed to fetch collection data:', error);
            throw error;
        }
    }
    async transferNFT(tokenId, to) {
        try {
            if (!this.wallet) {
                throw new Error('Not connected to Aptos');
            }
            const transaction = {
                arguments: [
                    this.wallet.address,
                    tokenId,
                    to,
                    "1"
                ],
                function: '0x3::token::transfer_script',
                type: 'entry_function_payload',
                type_arguments: [],
            };
            const pendingTransaction = await window.aptos.signAndSubmitTransaction(transaction);
            return {
                hash: pendingTransaction.hash
            };
        }
        catch (error) {
            throw new Error(`NFT transfer failed: ${error}`);
        }
    }
    async getBalance(address) {
        var _a;
        try {
            const targetAddress = address || ((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            const resources = await this.aptos.getAccountResources(targetAddress);
            const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
            if (!accountResource) {
                return 0;
            }
            return Number(accountResource.data.coin.value) / 100;
        }
        catch (error) {
            if (error.status === 404) {
                return 0;
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }
    async getWalletInfo() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not connected');
            }
            const balance = await this.getBalance();
            return {
                address: this.wallet.address,
                publicKey: this.wallet.publicKey,
                balance: balance.toString(),
                network: this.network,
            };
        }
        catch (error) {
            throw new Error(`Failed to get wallet info: ${error.message || error}`);
        }
    }
}
exports.AptosProvider = AptosProvider;
// Network URLs
AptosProvider.NETWORKS = {
    mainnet: 'https://fullnode.mainnet.aptoslabs.com',
    testnet: 'https://fullnode.testnet.aptoslabs.com',
    devnet: 'https://fullnode.devnet.aptoslabs.com'
};
