import { BlockchainProvider, NFT, NFTConfig, TokenConfig, TransactionConfig, TransactionResult, WalletAdapter, WalletInfo } from "../core/types";
import { AccountSet, Client, NFTokenCreateOffer, NFTokenMint, Payment, TrustSet, dropsToXrp, xrpToDrops } from "xrpl";
import { WalletAdapterRegistry } from "../wallets/WalletAdapterRegistry";
import { CrossmarkAdapter } from "../wallets/CrossmarkAdapter";
import { GemWalletAdapter } from "../wallets/GemWalletAdapter";

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
    private walletAdapter: WalletAdapter;
    private walletInfo: WalletInfo | null = null;
    private connection!: Client;
    private readonly network: string;

    private static readonly NETWORKS = {
        mainnet: 'wss://xrplcluster.com',
        testnet: 'wss://s.altnet.rippletest.net:51233',
        devnet: 'wss://s.devnet.rippletest.net:51233'
    };

    constructor(walletName: string, network: string) {
        this.network = network;
        const registry = WalletAdapterRegistry.getInstance();
        registry.registerAdapter('crossmark', new CrossmarkAdapter());
        registry.registerAdapter('gem', new GemWalletAdapter());
        this.walletAdapter = registry.getAdapter(walletName);
    }

    connectToWallet(): Promise<WalletInfo> {
        throw new Error("Method not implemented.");
    }
    transferToken(config: TransactionConfig): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }
    getNetwork(): string {
        throw new Error("Method not implemented.");
    }

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

    async isWalletInstalled(): Promise<boolean> {
        const maxRetries = 3;
        const delayMs = 1000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const isInstalled = await this.walletAdapter.isInstalled() ?? false;
                if (isInstalled) {
                    return true;
                }

                // If not installed, wait and retry unless it's the last attempt
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    console.debug(`Wallet not detected on attempt ${attempt}/${maxRetries}, retrying...`);
                    continue;
                }
            } catch (error) {
                if (attempt === maxRetries) {
                    throw new Error(`Failed to check if wallet is installed after ${maxRetries} attempts: ${error}`);
                }
                await new Promise(resolve => setTimeout(resolve, delayMs));
                console.warn(`Error on attempt ${attempt}/${maxRetries}, retrying...`);
            }
        }
        return false;
    }

    async getBalance(address?: string): Promise<number> {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }

            const targetAddress = address || this.walletInfo?.address;
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
        } catch (error: any) {
            if (error.data?.error === 'actNotFound') {
                return 0;
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }

    async connect(): Promise<string> {
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
        } catch (error) {
            throw new Error(`Failed to connect to XRPL: ${error}`);
        }
    }

    async establishConnection(): Promise<Client> {
        try {
            const networkUrl = XRPLProvider.NETWORKS[this.network as keyof typeof XRPLProvider.NETWORKS];
            if (!networkUrl) {
                throw new Error(`Invalid network: ${this.network}`);
            }

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
            await this.walletAdapter.disconnect();
            this.walletInfo = null;
        } catch (error) {
            throw new Error(`Disconnect failed: ${error}`);
        }
    }

    async sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            const payment: Payment = {
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
        } catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }

    async mintNFT(config: NFTConfig): Promise<TransactionResult> {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            const nftMint: NFTokenMint = {
                TransactionType: "NFTokenMint",
                Account: this.walletInfo.address,
                URI: this.utils.stringToHex(JSON.stringify(config.URI)),
                Flags: config.flags || 0,
                TransferFee: config.transferFee || 0,
                NFTokenTaxon: config.taxon
            };

            const prepared = await this.connection.autofill(nftMint);
            const response = await this.walletAdapter.signAndSubmit(prepared);

            const meta = response.result.meta;
            const nftID = typeof meta === 'object' && 'nftoken_id' in meta ? meta.nftoken_id : undefined;

            return {
                hash: response.result.hash,
                nftID: `${nftID}`,
            };
        } catch (error) {
            throw new Error(`NFT minting failed: ${error}`);
        }
    }

    async transferNFT(tokenId: string, to: string): Promise<TransactionResult> {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            const offerCreate: NFTokenCreateOffer = {
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
        } catch (error) {
            throw new Error(`NFT transfer failed: ${error}`);
        }
    }

    async mintToken(config: TokenConfig): Promise<TransactionResult> {
        try {
            if (!this.walletInfo || !this.connection) {
                throw new Error('Not connected to XRPL');
            }

            const accountSet: AccountSet = {
                TransactionType: "AccountSet",
                Account: this.walletInfo.address,
                SetFlag: 8
            };

            const prepared1 = await this.connection.autofill(accountSet);
            await this.walletAdapter.signAndSubmit(prepared1);

            const trustSet: TrustSet = {
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
        } catch (error) {
            throw new Error(`Token minting failed: ${error}`);
        }
    }

    async getNFTs(address?: string): Promise<Array<NFT>> {
        try {
            if (!this.connection || !this.connection.isConnected()) {
                throw new Error('Not connected to XRPL');
            }

            const targetAddress = address || this.walletInfo?.address;
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

            return Promise.all(
                response.result.account_nfts.map(async (nftToken: any) => {
                    let metadata: any = {};

                    if (nftToken.URI) {
                        try {
                            const decodedUri = this.utils.hexToString(nftToken.URI);
                            try {
                                metadata = JSON.parse(decodedUri);
                            } catch {
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
                        price: undefined
                    };
                })
            );
        } catch (error: any) {
            throw new Error(`Failed to fetch NFTs: ${error.message || error}`);
        }
    }

    private async fetchNFTMetadata(uri: string): Promise<any> {
        try {
            const url = uri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to fetch metadata from ${uri}: ${error}`);
            return {};
        }
    }

    // Implement remaining interface methods
    getTransactionStatus(hash: string): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }

    async getWalletInfo(): Promise<WalletInfo> {
        if (!this.walletInfo) {
            throw new Error('Wallet not connected');
        }
        return this.walletInfo;
    }

    estimateFee(config: TransactionConfig): Promise<string> {
        throw new Error("Method not implemented.");
    }

    validateAddress(address: string): boolean {
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
        return !!this.walletInfo && this.connection?.isConnected();
    }

    getBlockHeight(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async sign(message: string): Promise<string> {
        return await this.walletAdapter.sign(message);
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
}