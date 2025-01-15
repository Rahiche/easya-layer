import { AptosClient, AptosAccount, TokenClient, CoinClient, FaucetClient } from "aptos";
import { BlockchainProvider, NFT, NFTConfig, TokenConfig, TransactionConfig, TransactionResult, WalletInfo } from "../core/types";
import { Types } from "aptos";

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
    private tokenClient: TokenClient;
    private coinClient: CoinClient;
    private network: string;

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
        this.client = new AptosClient(nodeUrl);
        this.tokenClient = new TokenClient(this.client);
        this.coinClient = new CoinClient(this.client);
    }
    disconnect(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    establishConnection(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getTransactionStatus(hash: string): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }
    estimateFee(config: TransactionConfig): Promise<string> {
        throw new Error("Method not implemented.");
    }
    validateAddress(address: string): boolean {
        throw new Error("Method not implemented.");
    }
    mintToken(config: TokenConfig): Promise<TransactionResult> {
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
    getNFTs(address?: string): Promise<Array<NFT>> {
        throw new Error("Method not implemented.");
    }
    getNetwork(): string {
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

    async isWalletInstalled(): Promise<boolean> {
        return !!(window as any).aptos;
    }

    async connectToWallet(): Promise<WalletInfo> {
        const address = await this.connect();
        return this.getWalletInfo();
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
                arguments: [config.to, (Number(config.amount) * 100000000).toString()], // Convert APT to Octas
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

    async mintNFT(config: NFTConfig): Promise<TransactionResult> {
        try {
            if (!this.wallet) {
                throw new Error('Not connected to Aptos');
            }

            const collectionName = "MyCollection";
            const tokenName = config.name || "MyNFT";

            // Create collection transaction
            const createCollectionTransaction = {
                arguments: [
                    collectionName,
                    "Collection Description",
                    "Collection URI",
                    "18446744073709551615", // maximum u64
                    [false, false, false] // mutable description, URI, royalty
                ],
                function: '0x3::token::create_collection_script',
                type: 'entry_function_payload',
                type_arguments: [],
            };

            const collectionPending = await (window as any).aptos.signAndSubmitTransaction(createCollectionTransaction);
            await this.client.waitForTransactionWithResult(collectionPending.hash);

            // Create token transaction
            const createTokenTransaction = {
                arguments: [
                    collectionName,
                    tokenName,
                    config.description || "Token Description",
                    "1", // supply
                    "18446744073709551615", // maximum u64
                    config.URI || "",
                    this.wallet.address, // royalty payee address
                    "100", // royalty points denominator
                    "0", // royalty points numerator
                    [false, false, false, false, false], // mutable properties
                    [], // property keys
                    [], // property values
                    [], // property types
                ],
                function: '0x3::token::create_token_script',
                type: 'entry_function_payload',
                type_arguments: [],
            };

            const tokenPending = await (window as any).aptos.signAndSubmitTransaction(createTokenTransaction);
            const txn = await this.client.waitForTransactionWithResult(tokenPending.hash);

            return {
                hash: tokenPending.hash
            };
        } catch (error) {
            throw new Error(`NFT minting failed: ${error}`);
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
                    "1" // amount to transfer
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

            return Number((accountResource.data as any).coin.value) / 100; // Convert from Octas to APT
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