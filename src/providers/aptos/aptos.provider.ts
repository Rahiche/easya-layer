import { AptosClient } from "aptos";
import { Aptos, AptosConfig, NetworkToNetworkName } from '@aptos-labs/ts-sdk';
import { BlockchainProvider, NFT, NFTConfig, TokenConfig, TransactionConfig, TransactionResult, WalletInfo } from "../../core/types";

export interface AptosUtils {
    stringToHex(str: string): string;
    hexToString(hex: string): string;
    octalToDecimal(octal: string): string;
    decimalToOctal(decimal: string): string;
}

export interface AptosBlockchainProvider extends BlockchainProvider {
    utils: AptosUtils;
}

export class AptosProvider implements AptosBlockchainProvider {
    private wallet: any;
    private client: AptosClient;
    private network: string;
    private aptos: Aptos;

    // Network URLs
    private static readonly NETWORKS = {
        mainnet: 'https://fullnode.mainnet.aptoslabs.com',
        testnet: 'https://fullnode.testnet.aptoslabs.com',
        devnet: 'https://fullnode.devnet.aptoslabs.com'
    };

    // Initialize utils property
    public utils: AptosUtils = {
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

        octalToDecimal: (octal: string): string => {
            return parseInt(octal, 8).toString();
        },

        decimalToOctal: (decimal: string): string => {
            return parseInt(decimal).toString(8);
        }
    };

    constructor(network: string = 'testnet') {
        this.network = network;
        const nodeUrl = AptosProvider.NETWORKS[this.network as keyof typeof AptosProvider.NETWORKS];
        if (!nodeUrl) {
            throw new Error(`Invalid network: ${network}`);
        }
        const networkValue = NetworkToNetworkName[network];
        const config = new AptosConfig({ network: networkValue });
        this.aptos = new Aptos(config);
        this.client = new AptosClient(nodeUrl);
    }

    async disconnect(): Promise<void> {
        // Return without doing anything as a default implementation
        return;
    }

    async establishConnection(): Promise<any> {
        // Return a basic connection status object
        return { status: 'connected', timestamp: Date.now() };
    }

    async getTransactionStatus(hash: string): Promise<TransactionResult> {
        // Return a default transaction status
        return {
            hash: hash,
            status: 'unknown'
        };
    }

    async estimateFee(config: TransactionConfig): Promise<string> {
        // Return a default estimated fee
        return '0.001';
    }

    validateAddress(address: string): boolean {
        // Basic validation - check if it's a non-empty string
        return typeof address === 'string' && address.length > 0;
    }

    async mintToken(config: TokenConfig): Promise<TransactionResult> {
        // Return a default transaction result
        return {
            hash: '0x' + '0'.repeat(64),
            status: 'success'
        };
    }

    async transferToken(config: TransactionConfig): Promise<TransactionResult> {
        // Return a default transaction result
        return {
            hash: '0x' + '0'.repeat(64),
            status: 'success'
        };
    }

    async getTokenBalance(tokenId: string, address?: string): Promise<string> {
        // Return a default balance of '0'
        return '0';
    }

    async getNFTMetadata(tokenId: string): Promise<Record<string, any>> {
        // Return default metadata
        return {
            tokenId: tokenId,
            name: 'Unknown Token',
            description: 'Metadata not available'
        };
    }

    async getNFTs(address?: string): Promise<Array<NFT>> {
        // Return empty array as default
        return [];
    }

    getNetwork(): string {
        // Return the current network
        return this.network;
    }

    isConnected(): boolean {
        // Return connection status based on wallet existence
        return !!this.wallet;
    }

    async getBlockHeight(): Promise<number> {
        // Return default block height
        return 0;
    }

    async sign(message: string): Promise<string> {
        // Return a dummy signature
        return '0x' + '0'.repeat(130);
    }

    async verify(message: string, signature: string, address: string): Promise<boolean> {
        // Return false as default verification result
        return false;
    }

    subscribeToEvents(eventName: string, callback: (data: any) => void): void {
        // Do nothing as default implementation
    }

    unsubscribeFromEvents(eventName: string): void {
        // Do nothing as default implementation
    }

    // Keep existing implemented methods unchanged
    async isWalletInstalled(): Promise<boolean> {
        return !!(window as any).aptos;
    }

    async connect(): Promise<string> {
        try {
            if (!(window as any).aptos) {
                throw new Error('Aptos wallet is not installed');
            }

            const response = await (window as any).aptos.connect();
            const account = await (window as any).aptos.account();

            this.wallet = {
                address: account.address,
                publicKey: account.publicKey
            };

            return this.wallet.address;
        } catch (error) {
            throw new Error(`Failed to connect to Aptos: ${error}`);
        }
    }

    async sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
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

            const pendingTransaction = await (window as any).aptos.signAndSubmitTransaction(transaction);
            const txn = await this.client.waitForTransactionWithResult(pendingTransaction.hash);

            return {
                hash: pendingTransaction.hash
            };
        } catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }

    private async collectionExists(name: string): Promise<boolean> {
        try {
            const collection = await this.aptos.getCollectionData({
                creatorAddress: this.wallet.accountAddress,
                collectionName: name
            });
            return !!collection;
        } catch (error) {
            // If collection is not found, the API will throw an error
            return false;
        }
    }

    async mintNFT(config: NFTConfig): Promise<TransactionResult> {
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
        } catch (error) {
            console.error('NFT minting failed:', JSON.stringify(error, null, 2));
            throw new Error(`NFT minting failed: ${error}`);
        }
    }

    async getOwnedTokens(address: string): Promise<any> {
        try {
            const tokens = await this.aptos.getOwnedDigitalAssets({
                ownerAddress: address
            });
            return tokens;
        } catch (error) {
            console.error('Failed to fetch owned tokens:', error);
            throw error;
        }
    }

    async getCollectionData(collectionName: string): Promise<any> {
        try {
            return await this.aptos.getCollectionData({
                creatorAddress: this.wallet.accountAddress,
                collectionName
            });
        } catch (error) {
            console.error('Failed to fetch collection data:', error);
            throw error;
        }
    }

    async transferNFT(tokenId: string, to: string): Promise<TransactionResult> {
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

            const pendingTransaction = await (window as any).aptos.signAndSubmitTransaction(transaction);
            const txn = await this.client.waitForTransactionWithResult(pendingTransaction.hash);

            return {
                hash: pendingTransaction.hash
            };
        } catch (error) {
            throw new Error(`NFT transfer failed: ${error}`);
        }
    }

    async getBalance(address?: string): Promise<number> {
        try {
            const targetAddress = address || this.wallet?.address;
            if (!targetAddress) {
                throw new Error('No address provided and no wallet connected');
            }

            const resources = await this.client.getAccountResources(targetAddress);
            const accountResource = resources.find(
                (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
            );

            if (!accountResource) {
                return 0;
            }

            return Number((accountResource.data as any).coin.value) / 100;
        } catch (error: any) {
            if (error.status === 404) {
                return 0;
            }
            throw new Error(`Failed to get balance: ${error.message || error}`);
        }
    }

    async getWalletInfo(): Promise<WalletInfo> {
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
        } catch (error: any) {
            throw new Error(`Failed to get wallet info: ${error.message || error}`);
        }
    }
}