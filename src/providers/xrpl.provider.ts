import { BlockchainProvider, NFT, NFTConfig, TokenConfig, TransactionConfig, TransactionResult, WalletInfo } from "../core/types";
import { AccountSet, Client, NFTokenMint, Payment, TrustSet, dropsToXrp, xrpToDrops } from "xrpl";
import sdk from '@crossmarkio/sdk';

export interface XRPLUtils {
    stringToHex(str: string): string;
    hexToString(hex: string): string;
    dropsToXRP(drops: string): string;
    xrpToDrops(xrp: string): string;
}


export interface XRPLBlockchainProvider extends BlockchainProvider {
    utils: XRPLUtils;
}

export class XRPLProvider implements XRPLBlockchainProvider {
    private wallet: any;
    private connection!: Client;
    private network: string;

    // Network URLs
    private static readonly NETWORKS = {
        mainnet: 'wss://xrplcluster.com',
        testnet: 'wss://s.altnet.rippletest.net:51233',
        devnet: 'wss://s.devnet.rippletest.net:51233'
    };

    // Initialize utils property
    public utils: XRPLUtils = {
        stringToHex: (str: string): string => {
            return Array.from(new TextEncoder().encode(str))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        hexToString: (hex: string): string => {
            const bytes = new Uint8Array(
                hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
            );
            return new TextDecoder().decode(bytes);
        },

        dropsToXRP: (drops: string): string => {
            return dropsToXrp(drops).toString();
        },

        xrpToDrops: (xrp: string): string => {
            return xrpToDrops(xrp);
        }
    };

    constructor(network: string = 'mainnet') {
        this.network = network;
    }

    async getBalance(address?: string): Promise<number> {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }

            // Use provided address or default to connected wallet's address
            const targetAddress = address || this.wallet?.address;
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
        } catch (error: any) {
            // Handle specific XRPL errors
            if (error.data?.error === 'actNotFound') {
                return 0; // Return 0 balance for non-existent accounts
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }

    getTransactionStatus(hash: string): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }
    async getWalletInfo(): Promise<WalletInfo> {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not connected');
            }

            // Get the balance
            const balance = await this.getBalance();

            return {
                address: this.wallet.address,
                publicKey: this.wallet.publicKey,
                balance: balance.toString(),
                network: this.network,
            };
        } catch (error: any) {
            throw new Error(`Failed to get wallet info: ${error.message || error}`);
        }
    }

    estimateFee(config: TransactionConfig): Promise<string> {
        throw new Error("Method not implemented.");
    }
    validateAddress(address: string): boolean {
        throw new Error("Method not implemented.");
    }
    transferToken(config: TransactionConfig): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }
    getTokenBalance(tokenId: string, address?: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getNFTBalance(address?: string): Promise<Array<string>> {
        throw new Error("Method not implemented.");
    }
    getNFTMetadata(tokenId: string): Promise<Record<string, any>> {
        throw new Error("Method not implemented.");
    }
    isConnected(): boolean {
        throw new Error("Method not implemented.");
    }
    getBlockHeight(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    sign(message: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    verify(message: string, signature: string, address: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    subscribeToEvents(eventName: string, callback: (data: any) => void): void {
        throw new Error("Method not implemented.");
    }
    unsubscribeFromEvents(eventName: string): void {
        throw new Error("Method not implemented.");
    }

    async connect(): Promise<string> {
        try {
            // Connect to wallet first
            this.wallet = await this.connectToWallet();

            // Then establish XRPL connection
            this.connection = await this.establishConnection();

            // Return the connected wallet address
            return this.wallet.address;
        } catch (error) {
            throw new Error(`Failed to connect to XRPL: ${error}`);
        }
    }

    async connectToWallet() {
        try {
            // Check if Crossmark is installed
            const isInstalled = sdk.sync.isInstalled();

            if (!isInstalled) {
                throw new Error('Crossmark wallet is not installed');
            }

            // Request wallet connection
            let { request, response, createdAt, resolvedAt } = await sdk.methods.signInAndWait();


            // Verify connection and return wallet info
            if (!response || !response.data.address) {
                throw new Error('Failed to connect to Crossmark wallet');
            }

            return {
                address: response.data.address,
                publicKey: response.data.publicKey
            };
        } catch (error) {
            throw new Error(`Wallet connection failed: ${error}`);
        }
    }

    async establishConnection(): Promise<Client> {
        try {
            // Get network URL
            const networkUrl = XRPLProvider.NETWORKS[this.network as keyof typeof XRPLProvider.NETWORKS];
            if (!networkUrl) {
                throw new Error(`Invalid network: ${this.network}`);
            }

            // Create and connect XRPL client
            const client = new Client(networkUrl);
            await client.connect();

            return client;
        } catch (error) {
            throw new Error(`XRPL connection failed: ${error}`);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.connection?.isConnected()) {
                await this.connection.disconnect();
            }
            // Reset wallet state
            this.wallet = null;
        } catch (error) {
            throw new Error(`Disconnect failed: ${error}`);
        }
    }

    /**
    * Send a transaction on XRPL
    * @param destination Destination address
    * @param amount Amount to send (in drops)
    * @param options Additional transaction options
    */
    async sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            // Prepare the payment transaction
            const payment: Payment = {
                TransactionType: "Payment",
                Account: this.wallet.address,
                Destination: config.to,
                Amount: config.amount.toString(),
            };

            // Autofill fields like Fee, Sequence, and LastLedgerSequence
            const prepared = await this.connection.autofill(payment);

            // Sign and submit the transaction using Crossmark wallet
            const { request, response } = await sdk.methods.signAndSubmitAndWait(prepared as any);

            if (!response || !response.data) {
                throw new Error('Transaction signing or submission failed');
            }

            // Return the transaction hash
            return {
                hash: response.data.resp.result.hash
            };

        } catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }


    /**
        * Mint an NFT on XRPL
        * @param config NFT configuration
        */
    async mintNFT(config: NFTConfig): Promise<TransactionResult> {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }


            const nftMint: NFTokenMint = {
                TransactionType: "NFTokenMint",
                Account: this.wallet.address,
                URI: this.utils.stringToHex(JSON.stringify(config.URI)),
                Flags: config.flags || 0,
                TransferFee: config.transferFee || 0,
                NFTokenTaxon: config.taxon
            };


            const transactionBlob = {
                ...nftMint,
            };

            console.log(`this.wallet ${this.wallet}`);
            console.log(`transactionBlob ${JSON.stringify(transactionBlob)}`);

            // Sign and submit NFTokenMint
            const { response } = await sdk.methods.signAndSubmitAndWait(transactionBlob, this.wallet);

            if (!response || !response.data) {
                throw new Error('NFT minting failed');
            }

            return {
                hash: response.data.resp.result.hash
            };
        } catch (error) {
            throw new Error(`NFT minting failed: ${error}`);
        }
    }

    async transferNFT(tokenId: string, to: string): Promise<TransactionResult> {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            // Create NFTokenCreateOffer transaction
            const offerCreate = {
                TransactionType: "NFTokenCreateOffer",
                Account: this.wallet.address,
                NFTokenID: tokenId,
                Destination: to,
                Amount: "0", // Required for transfer offers even if free
                Flags: 1 // tfSellNFToken flag
            };

            // Sign and submit the transaction using Crossmark wallet
            const { response } = await sdk.methods.signAndSubmitAndWait(offerCreate as any);

            if (!response || !response.data) {
                throw new Error('NFT transfer failed');
            }

            return {
                hash: response.data.resp.result.hash
            };
        } catch (error) {
            throw new Error(`NFT transfer failed: ${error}`);
        }
    }

    /**
     * Mint a new token on XRPL
     * @param config Token configuration
     */
    async mintToken(config: TokenConfig): Promise<TransactionResult> {
        try {
            if (!this.wallet || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            // First, set account to allow rippling
            const accountSet: AccountSet = {
                TransactionType: "AccountSet",
                Account: this.wallet.address,
                SetFlag: 8 // Enable rippling
            };

            // Sign and submit AccountSet
            await sdk.methods.signAndSubmitAndWait({
                // transaction: accountSet
            });

            // Create trust line for the token
            const trustSet: TrustSet = {
                TransactionType: "TrustSet",
                Account: this.wallet.address,
                LimitAmount: {
                    currency: config.currency,
                    issuer: config.issuer,
                    value: config.limit || "1000000000"
                }
            };

            // Sign and submit TrustSet
            const { response } = await sdk.methods.signAndSubmitAndWait({
                // transaction: trustSet
            });

            if (!response || !response.data) {
                throw new Error('Token minting failed');
            }

            return {
                hash: response.data.resp.result.hash,
            };
        } catch (error) {
            throw new Error(`Token minting failed: ${error}`);
        }
    }



    // Getter for the connection
    getConnection(): Client {
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
    getNetwork(): string {
        return this.network;
    }

    async getNFTs(address?: string): Promise<Array<NFT>> {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }

            // Use provided address or default to connected wallet's address
            const targetAddress = address || this.wallet?.address;
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }

            // Request NFToken objects from XRPL
            const response = await this.connection.request({
                command: 'account_nfts',
                account: targetAddress,
            });

            if (!response.result || !response.result.account_nfts) {
                return [];
            }

            // Transform XRPL NFToken objects to our NFT interface
            const nfts: NFT[] = await Promise.all(
                response.result.account_nfts.map(async (nftToken: any) => {
                    let metadata: any = {};

                    if (nftToken.URI) {
                        try {
                            const decodedUri = this.utils.hexToString(nftToken.URI);

                            // Try parsing the URI directly as JSON first
                            try {
                                metadata = JSON.parse(decodedUri);
                            } catch {
                                // If not valid JSON, treat as URI
                                if (decodedUri.startsWith('ipfs://') || decodedUri.startsWith('http')) {
                                    metadata = await this.fetchNFTMetadata(decodedUri);
                                }
                            }
                        } catch (error) {
                            console.warn(`Failed to process metadata for NFT: ${error}`);
                        }
                    }

                    return {
                        id: nftToken.NFTokenID,
                        name: metadata?.name || 'Unnamed NFT',
                        description: metadata?.description || 'No description available',
                        imageUrl: metadata?.image || '/api/placeholder/300/300',
                        owner: targetAddress,
                        // Note: XRPL NFTs don't have native price properties
                        price: undefined
                    };
                })
            );

            return nfts;
        } catch (error: any) {
            throw new Error(`Failed to fetch NFTs: ${error.message || error}`);
        }
    }

    // Helper method to fetch metadata from IPFS or HTTP
    private async fetchNFTMetadata(uri: string): Promise<any> {
        try {
            // Convert IPFS URI to HTTP if necessary
            const url = uri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri;

            const response = await fetch(url);
            const metadata = await response.json();
            return metadata;
        } catch (error) {
            console.warn(`Failed to fetch metadata from ${uri}: ${error}`);
            return {};
        }
    }
}