"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRPLProvider = void 0;
const xrpl_1 = require("xrpl");
const WalletAdapterRegistry_1 = require("../../wallets/WalletAdapterRegistry");
const CrossmarkAdapter_1 = require("../../wallets/CrossmarkAdapter");
const GemWalletAdapter_1 = require("../../wallets/GemWalletAdapter");
const XRPLUtils_1 = require("./XRPLUtils");
const currencyCodeValidator_1 = require("./currencyCodeValidator");
class XRPLProvider {
    constructor(walletName, network) {
        this.walletInfo = null;
        this.network = network;
        const registry = WalletAdapterRegistry_1.WalletAdapterRegistry.getInstance();
        registry.registerAdapter('crossmark', new CrossmarkAdapter_1.CrossmarkAdapter());
        registry.registerAdapter('gem', new GemWalletAdapter_1.GemWalletAdapter());
        this.walletAdapter = registry.getAdapter(walletName);
    }
    xrplUtils() {
        return new XRPLUtils_1.XRPLUtils(this.connection);
        ;
    }
    async issueToken(config) {
        var _a;
        if (!this.connection || !this.connection.isConnected()) {
            throw new Error('Not connected to XRPL');
        }
        if (!((_a = this.walletInfo) === null || _a === void 0 ? void 0 : _a.address)) {
            throw new Error('Wallet not connected');
        }
        currencyCodeValidator_1.CurrencyCodeValidator.validateForIssuance(config);
        try {
            // Generate a new cold wallet
            const coldWallet = await this.connection.fundWallet();
            console.log('Generated cold wallet:', coldWallet.wallet.address);
            // 1. Configure cold wallet settings
            const coldSettingsTx = {
                TransactionType: "AccountSet",
                Account: coldWallet.wallet.address,
                TransferRate: config.transferRate,
                TickSize: config.tickSize,
                Domain: "6578616D706C652E636F6D",
                SetFlag: xrpl_1.AccountSetAsfFlags.asfDefaultRipple,
                Fee: "12",
                Flags: ((config.disallowXRP ? xrpl_1.AccountSetTfFlags.tfDisallowXRP : 0) |
                    (config.requireDestTag ? xrpl_1.AccountSetTfFlags.tfRequireDestTag : 0))
            };
            const networkUrl = XRPLProvider.NETWORKS[this.network];
            const coldClient = new xrpl_1.Client(networkUrl);
            await coldClient.connect();
            try {
                const accountInfo = await coldClient.request({
                    command: 'account_info',
                    account: coldWallet.wallet.address
                });
                // Add sequence to transaction
                coldSettingsTx.Sequence = accountInfo.result.account_data.Sequence;
                await coldClient.autofill(coldSettingsTx);
                const { tx_blob: signed_tx_blob, hash } = coldWallet.wallet.sign(coldSettingsTx);
                console.log('signed_tx_blob:', signed_tx_blob);
                const result = await coldClient.submit(signed_tx_blob);
                console.log('result:', result);
            }
            catch (error) {
                console.error(`Failed to sign transaction: ${error}`);
            }
            // if (coldSettingsResult.data.resp.result.meta.TransactionResult !== "tesSUCCESS") {
            //     throw new Error(`Failed to configure cold wallet settings: ${coldSettingsResult.result.meta.TransactionResult}`);
            // }
            // 2. Create trust line from hot wallet to cold wallet
            const limitAmount = currencyCodeValidator_1.TrustSetHandler.createLimitAmount(config.currencyCode, coldWallet.wallet.address, config.amount);
            const trustSetTx = {
                TransactionType: "TrustSet",
                Account: this.walletInfo.address,
                LimitAmount: limitAmount
            };
            const preparedTrustSet = await this.connection.autofill(trustSetTx);
            const trustSetResult = await this.walletAdapter.signAndSubmit(preparedTrustSet);
            console.log("trustSetResult:", trustSetResult);
            // if (trustSetResult.data.resp.result.meta.TransactionResult !== "tesSUCCESS") {
            //     throw new Error(`Failed to set trust line: ${trustSetResult.result.meta.TransactionResult}`);
            // }
            console.log("limitAmount.currency:", limitAmount.currency);
            // 3. Issue tokens from cold wallet to hot wallet
            const paymentTx = {
                TransactionType: "Payment",
                Account: coldWallet.wallet.address,
                Destination: this.walletInfo.address,
                Amount: {
                    currency: limitAmount.currency,
                    value: config.amount,
                    issuer: coldWallet.wallet.address
                }
            };
            console.log("paymentTx:", paymentTx);
            const accountInfo = await coldClient.request({
                command: 'account_info',
                account: coldWallet.wallet.address
            });
            // Add sequence to transaction
            paymentTx.Sequence = accountInfo.result.account_data.Sequence;
            const a = await coldClient.autofill(paymentTx);
            const { tx_blob: signed_tx_blob2, hash } = coldWallet.wallet.sign(a);
            console.log('signed_tx_blob2:', signed_tx_blob2);
            const result = await coldClient.submit(signed_tx_blob2);
            // const preparedPayment = await this.connection.autofill(paymentTx);
            // const signedPayment = coldWallet.wallet.sign(preparedPayment);
            // const paymentResult = await this.connection.submitAndWait(signedPayment);
            await coldClient.disconnect();
            console.log("result:", result);
            return {
                hash: result.result.tx_blob,
            };
        }
        catch (error) {
            throw new Error(`Token issuance failed: ${error.message || error}`);
        }
    }
    async isWalletInstalled() {
        var _a;
        const maxRetries = 3;
        const delayMs = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const isInstalled = (_a = await this.walletAdapter.isInstalled()) !== null && _a !== void 0 ? _a : false;
                if (isInstalled) {
                    return true;
                }
                // If not installed, wait and retry unless it's the last attempt
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    console.debug(`Wallet not detected on attempt ${attempt}/${maxRetries}, retrying...`);
                    continue;
                }
            }
            catch (error) {
                if (attempt === maxRetries) {
                    throw new Error(`Failed to check if wallet is installed after ${maxRetries} attempts: ${error}`);
                }
                await new Promise(resolve => setTimeout(resolve, delayMs));
                console.warn(`Error on attempt ${attempt}/${maxRetries}, retrying...`);
            }
        }
        return false;
    }
    async getBalance(address) {
        var _a, _b;
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const targetAddress = address || ((_a = this.walletInfo) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            const response = await this.connection.request({
                command: 'account_info',
                account: targetAddress,
                ledger_index: 'validated'
            });
            const balanceInDrops = response.result.account_data.Balance;
            return Number(balanceInDrops);
        }
        catch (error) {
            if (((_b = error.data) === null || _b === void 0 ? void 0 : _b.error) === 'actNotFound') {
                return 0;
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }
    async connect() {
        try {
            const isInstalled = await this.isWalletInstalled();
            if (!isInstalled) {
                throw new Error('Wallet is not installed');
            }
            // Connect to wallet
            this.walletInfo = await this.walletAdapter.connect();
            // Establish XRPL connection
            this.connection = await this.establishConnection();
            return this.walletInfo.address;
        }
        catch (error) {
            throw new Error(`Failed to connect to XRPL: ${error}`);
        }
    }
    async establishConnection() {
        try {
            const networkUrl = XRPLProvider.NETWORKS[this.network];
            if (!networkUrl) {
                throw new Error(`Invalid network: ${this.network}`);
            }
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
            await this.walletAdapter.disconnect();
            this.walletInfo = null;
        }
        catch (error) {
            throw new Error(`Disconnect failed: ${error}`);
        }
    }
    async sendTransaction(config) {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            const payment = {
                TransactionType: "Payment",
                Account: this.walletInfo.address,
                Destination: config.to,
                Amount: (Number(config.amount) * 1000000).toString(),
            };
            const prepared = await this.connection.autofill(payment);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            console.log('Transaction response:', response);
            return {
                hash: response.result.hash
            };
        }
        catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }
    async mintNFT(config) {
        var _a;
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            const nftMint = {
                TransactionType: "NFTokenMint",
                Account: this.walletInfo.address,
                URI: this.xrplUtils().stringToHex(JSON.stringify(config.URI)),
                Flags: config.flags || 0,
                TransferFee: config.transferFee || 0,
                NFTokenTaxon: config.taxon
            };
            const prepared = await this.connection.autofill(nftMint);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            console.log('NFT mint response:', response);
            let nftID = typeof response.result.meta === 'object' && 'nftoken_id' in response.result.meta
                ? response.result.meta.nftoken_id
                : undefined;
            // If nftID is not in the metadata, fetch it from the transaction details
            if (!nftID || nftID == undefined || nftID == null) {
                const txResponse = await this.connection.request({
                    command: 'tx',
                    transaction: response.result.hash
                });
                console.log('Transaction response:', txResponse);
                if (typeof ((_a = txResponse.result) === null || _a === void 0 ? void 0 : _a.meta) === 'object' && 'nftoken_id' in txResponse.result.meta) {
                    nftID = txResponse.result.meta.nftoken_id;
                }
            }
            return {
                hash: response.result.hash,
                nftID: nftID ? `${nftID}` : undefined,
            };
        }
        catch (error) {
            throw new Error(`NFT minting failed: ${error}`);
        }
    }
    async issueFungibleToken(config) {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            // Validate currency code
            if (!config.currency || config.currency.length < 1 || config.currency.length > 4) {
                throw new Error('Invalid currency code. Must be 1-4 characters for standard currencies.');
            }
            let trustLineHash;
            // Create trust line if limit is specified
            if (config.limit) {
                const trustSetTx = {
                    TransactionType: "TrustSet",
                    Account: config.destination,
                    LimitAmount: {
                        currency: config.currency,
                        issuer: config.issuer,
                        value: config.limit
                    }
                };
                const preparedTrust = await this.connection.autofill(trustSetTx);
                const trustResponse = await this.walletAdapter.signAndSubmit(preparedTrust);
                if (trustResponse.result.engine_result !== 'tesSUCCESS') {
                    throw new Error(`Trust line creation failed: ${trustResponse.result.engine_result_message}`);
                }
                trustLineHash = trustResponse.result.hash;
                // Wait for trust line to be validated
                await this.connection.request({
                    command: 'ledger_current'
                });
            }
            // Issue tokens
            const issuance = {
                TransactionType: "Payment",
                Account: config.issuer,
                Destination: config.destination,
                Amount: {
                    currency: config.currency,
                    value: config.amount,
                    issuer: config.issuer
                }
            };
            // Add destination tag if provided
            if (config.destinationTag !== undefined) {
                issuance.DestinationTag = config.destinationTag;
            }
            // Set transfer rate if provided
            if (config.transferRate !== undefined) {
                const transferRateTx = {
                    TransactionType: "AccountSet",
                    Account: config.issuer,
                    TransferRate: Math.floor(config.transferRate * 1000000000)
                };
                const preparedTransferRate = await this.connection.autofill(transferRateTx);
                await this.walletAdapter.signAndSubmit(preparedTransferRate);
            }
            const prepared = await this.connection.autofill(issuance);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            if (response.result.engine_result !== 'tesSUCCESS') {
                throw new Error(`Token issuance failed: ${response.result.engine_result_message}`);
            }
            return {
                trustLineHash,
                issuanceHash: response.result.hash,
                amount: config.amount,
                currency: config.currency
            };
        }
        catch (error) {
            throw new Error(`Failed to issue token: ${error}`);
        }
    }
    async transferNFT(tokenId, to) {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            const offerCreate = {
                TransactionType: "NFTokenCreateOffer",
                Account: this.walletInfo.address,
                NFTokenID: tokenId,
                Destination: to,
                Amount: "0",
                Flags: 1
            };
            const prepared = await this.connection.autofill(offerCreate);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            return {
                hash: response.result.hash
            };
        }
        catch (error) {
            throw new Error(`NFT transfer failed: ${error}`);
        }
    }
    async mintToken(config) {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            const accountSet = {
                TransactionType: "AccountSet",
                Account: this.walletInfo.address,
                SetFlag: 8
            };
            const prepared1 = await this.connection.autofill(accountSet);
            await this.walletAdapter.signAndSubmit(prepared1);
            const trustSet = {
                TransactionType: "TrustSet",
                Account: this.walletInfo.address,
                LimitAmount: {
                    currency: config.currency,
                    issuer: config.issuer,
                    value: config.limit || "1000000000"
                }
            };
            const prepared2 = await this.connection.autofill(trustSet);
            const response = await this.walletAdapter.signAndSubmit(prepared2);
            return {
                hash: response.result.hash,
            };
        }
        catch (error) {
            throw new Error(`Token minting failed: ${error}`);
        }
    }
    async getNFTs(address) {
        var _a;
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const targetAddress = address || ((_a = this.walletInfo) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            const response = await this.connection.request({
                command: 'account_nfts',
                account: targetAddress,
            });
            if (!response.result || !response.result.account_nfts) {
                return [];
            }
            return Promise.all(response.result.account_nfts.map(async (nftToken) => {
                let metadata = {};
                if (nftToken.URI) {
                    try {
                        const decodedUri = this.xrplUtils().hexToString(nftToken.URI);
                        try {
                            metadata = JSON.parse(decodedUri);
                        }
                        catch (_a) {
                            if (decodedUri.startsWith('ipfs://') || decodedUri.startsWith('http')) {
                                metadata = await this.fetchNFTMetadata(decodedUri);
                            }
                        }
                    }
                    catch (error) {
                        console.warn(`Failed to process metadata for NFT: ${error}`);
                    }
                }
                return {
                    id: nftToken.NFTokenID,
                    name: (metadata === null || metadata === void 0 ? void 0 : metadata.name) || 'Unnamed NFT',
                    description: (metadata === null || metadata === void 0 ? void 0 : metadata.description) || 'No description available',
                    imageUrl: (metadata === null || metadata === void 0 ? void 0 : metadata.image) || '/api/placeholder/300/300',
                    owner: targetAddress,
                    price: undefined
                };
            }));
        }
        catch (error) {
            throw new Error(`Failed to fetch NFTs: ${error.message || error}`);
        }
    }
    async fetchNFTMetadata(uri) {
        try {
            const url = uri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri;
            const response = await fetch(url);
            return await response.json();
        }
        catch (error) {
            console.warn(`Failed to fetch metadata from ${uri}: ${error}`);
            return {};
        }
    }
    async getTransactionStatus(hash) {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const response = await this.connection.request({
                command: 'tx',
                transaction: hash
            });
            return {
                hash: response.result.hash,
                status: response.result.validated ? 'confirmed' : 'pending',
                // timestamp: response.result.date,
                // blockNumber: response.result.ledger_index
            };
        }
        catch (error) {
            throw new Error(`Failed to get transaction status: ${error}`);
        }
    }
    async getWalletInfo() {
        if (!this.walletInfo) {
            throw new Error('Wallet not connected');
        }
        return this.walletInfo;
    }
    async estimateFee(config) {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const response = await this.connection.request({
                command: 'fee'
            });
            // Convert drops to XRP and add some buffer for safety
            const baseFee = (0, xrpl_1.dropsToXrp)(response.result.drops.base_fee);
            const estimatedFee = (Number(baseFee) * 1.5).toFixed(6);
            return estimatedFee;
        }
        catch (error) {
            throw new Error(`Failed to estimate fee: ${error}`);
        }
    }
    async sendCurrency(config) {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            const payment = {
                TransactionType: "Payment",
                Account: this.walletInfo.address,
                Amount: {
                    currency: config.currency,
                    value: config.amount,
                    issuer: config.issuer
                },
                Destination: config.destination,
            };
            const prepared = await this.connection.autofill(payment);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            console.log('Currency payment response:', response);
            return {
                hash: response.result.hash,
                status: response.result.validated ? 'confirmed' : 'pending'
            };
        }
        catch (error) {
            throw new Error(`Currency payment failed: ${error}`);
        }
    }
    async createTrustLine(config) {
        try {
            // Verify connection state
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }
            // Validate inputs
            if (!config.currency || !config.issuer) {
                throw new Error('Currency and issuer are required');
            }
            const limitAmount = currencyCodeValidator_1.TrustSetHandler.createLimitAmount(config.currency, config.issuer, config.limit || "1000000000");
            // Create TrustSet transaction
            const trustSet = {
                TransactionType: "TrustSet",
                Account: this.walletInfo.address,
                LimitAmount: limitAmount
            };
            // Prepare and submit the transaction
            const prepared = await this.connection.autofill(trustSet);
            const response = await this.walletAdapter.signAndSubmit(prepared);
            console.log('Trust line creation response:', response);
            return {
                hash: response.result.hash
            };
        }
        catch (error) {
            throw new Error(`Failed to create trust line: ${error}`);
        }
    }
    async getBalances(address) {
        var _a, _b;
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const targetAddress = address || ((_a = this.walletInfo) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            // Get native XRP balance
            const nativeBalance = await this.getBalance(targetAddress);
            const balances = [{
                    currency: 'XRP',
                    value: (0, xrpl_1.dropsToXrp)(nativeBalance).toString(),
                    issuer: undefined,
                    nonStandard: "XRP",
                }];
            // Get issued currency balances
            try {
                const response = await this.connection.request({
                    command: 'account_lines',
                    account: targetAddress,
                    ledger_index: 'validated'
                });
                const lines = response.result.lines;
                if (Array.isArray(lines)) {
                    for (const line of lines) {
                        if (line.balance !== '0') {
                            let currency = line.currency;
                            // Convert hex to ASCII if currency is longer than 3 characters
                            let nonStandard = '';
                            if (currency.length > 3) {
                                nonStandard = currencyCodeValidator_1.CurrencyCodeValidator.convertFromHex(currency);
                                nonStandard = nonStandard
                                    .replace(/\u0000/g, '')
                                    .trim();
                                nonStandard = nonStandard.trim();
                            }
                            balances.push({
                                currency: currency,
                                value: line.balance,
                                issuer: line.account,
                                nonStandard: nonStandard,
                            });
                        }
                    }
                }
            }
            catch (error) {
                // If account_lines fails but we have XRP balance, just return that
                if (((_b = error.data) === null || _b === void 0 ? void 0 : _b.error) !== 'actNotFound') {
                    console.warn('Failed to fetch issued currency balances:', error);
                }
            }
            console.log('Balances:', balances);
            return balances;
        }
        catch (error) {
            console.error('Error in getBalances:', error);
            throw error;
        }
    }
    validateAddress(address) {
        // Basic XRP address validation
        const xrpAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
        return xrpAddressRegex.test(address);
    }
    async getTokenBalance(tokenId, address) {
        var _a;
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const targetAddress = address || ((_a = this.walletInfo) === null || _a === void 0 ? void 0 : _a.address);
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }
            const response = await this.connection.request({
                command: 'account_lines',
                account: targetAddress
            });
            const token = response.result.lines.find((line) => line.currency === tokenId);
            return token ? token.balance : '0';
        }
        catch (error) {
            throw new Error(`Failed to get token balance: ${error}`);
        }
    }
    async getNFTMetadata(tokenId) {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const response = await this.connection.request({
                command: 'nft_info',
                nft_id: tokenId
            });
            const nftInfo = response.result;
            let metadata = {};
            if (nftInfo.uri) {
                const decodedUri = this.xrplUtils().hexToString(nftInfo.uri);
                try {
                    metadata = JSON.parse(decodedUri);
                }
                catch (_a) {
                    if (decodedUri.startsWith('ipfs://') || decodedUri.startsWith('http')) {
                        metadata = await this.fetchNFTMetadata(decodedUri);
                    }
                }
            }
            return {
                ...metadata,
                tokenId,
                owner: nftInfo.owner,
                flags: nftInfo.flags,
                transferFee: nftInfo.transfer_fee,
                issuer: nftInfo.issuer,
                nftSerial: nftInfo.nft_serial
            };
        }
        catch (error) {
            throw new Error(`Failed to get NFT metadata: ${error}`);
        }
    }
    isConnected() {
        var _a;
        return !!this.walletInfo && ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.isConnected());
    }
    transferToken(config) {
        throw new Error("Method not implemented.");
    }
    getNetwork() {
        return this.network;
    }
    async getBlockHeight() {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }
            const response = await this.connection.request({
                command: 'ledger',
                ledger_index: 'validated'
            });
            return response.result.ledger.ledger_index;
        }
        catch (error) {
            throw new Error(`Failed to get block height: ${error}`);
        }
    }
    async sign(message) {
        return await this.walletAdapter.sign(message);
    }
    async verify(message, signature, address) {
        try {
            // Use client.request to verify the signature
            const response = await this.connection.request({
                command: 'submit',
                tx_blob: message
            });
            return response.result.engine_result === 'tesSUCCESS';
        }
        catch (error) {
            throw new Error(`Verification failed: ${error}`);
        }
    }
    subscribeToEvents(eventName, callback) {
        if (!this.connection || !this.connection.isConnected()) {
            throw new Error('Not connected to XRPL');
        }
        console.log('Subscribing to events:', eventName);
        switch (eventName) {
            case 'connected':
                this.connection.on('connected', callback);
                break;
            case 'disconnected':
                this.connection.on('disconnected', callback);
                break;
            case 'ledgerClosed':
                this.connection.request({
                    command: 'subscribe',
                    streams: ['ledger']
                });
                this.connection.on('ledgerClosed', callback);
                break;
            case 'validationReceived':
                this.connection.request({
                    command: 'subscribe',
                    streams: ['validations']
                });
                this.connection.on('validationReceived', callback);
                break;
            case 'transaction':
                this.connection.request({
                    command: 'subscribe',
                    streams: ['transactions']
                });
                this.connection.on('transaction', callback);
                break;
            case 'peerStatusChange':
                this.connection.request({
                    command: 'subscribe',
                    streams: ['peer_status']
                });
                this.connection.on('peerStatusChange', callback);
                break;
            case 'consensusPhase':
                this.connection.request({
                    command: 'subscribe',
                    streams: ['consensus']
                });
                this.connection.on('consensusPhase', callback);
                break;
            case 'manifestReceived':
                this.connection.on('manifestReceived', callback);
                break;
            case 'error':
                this.connection.on('error', callback);
                break;
            default:
                throw new Error(`Unsupported event type: ${eventName}`);
        }
    }
    unsubscribeFromEvents(eventName) {
        if (!this.connection || !this.connection.isConnected()) {
            throw new Error('Not connected to XRPL');
        }
        switch (eventName) {
            case 'connected':
                this.connection.off('connected');
                break;
            case 'disconnected':
                this.connection.off('disconnected');
                break;
            case 'ledgerClosed':
                this.connection.request({
                    command: 'unsubscribe',
                    streams: ['ledger']
                });
                this.connection.off('ledgerClosed');
                break;
            case 'validationReceived':
                this.connection.request({
                    command: 'unsubscribe',
                    streams: ['validations']
                });
                this.connection.off('validationReceived');
                break;
            case 'transaction':
                this.connection.request({
                    command: 'unsubscribe',
                    streams: ['transactions']
                });
                this.connection.off('transaction');
                break;
            case 'peerStatusChange':
                this.connection.request({
                    command: 'unsubscribe',
                    streams: ['peer_status']
                });
                this.connection.off('peerStatusChange');
                break;
            case 'consensusPhase':
                this.connection.request({
                    command: 'unsubscribe',
                    streams: ['consensus']
                });
                this.connection.off('consensusPhase');
                break;
            case 'manifestReceived':
                this.connection.off('manifestReceived');
                break;
            case 'error':
                this.connection.off('error');
                break;
            default:
                throw new Error(`Unsupported event type: ${eventName}`);
        }
    }
}
exports.XRPLProvider = XRPLProvider;
XRPLProvider.NETWORKS = {
    mainnet: 'wss://xrplcluster.com',
    testnet: 'wss://s.altnet.rippletest.net:51233',
    devnet: 'wss://s.devnet.rippletest.net:51233'
};
