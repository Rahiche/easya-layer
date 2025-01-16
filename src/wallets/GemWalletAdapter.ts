import { WalletAdapter, WalletInfo } from "../core/types";
import {
    isInstalled,
    getAddress,
    getPublicKey,
    getNetwork,
    signMessage as gemSignMessage,
    sendPayment,
    submitTransaction
} from "@gemwallet/api";

interface MintNFTFlags {
    tfBurnable?: boolean;
    tfOnlyXRP?: boolean;
    tfTrustLine?: boolean;
    tfTransferable?: boolean;
}
export class GemWalletAdapter implements WalletAdapter {
    private connected: boolean = false;

    async isInstalled(): Promise<boolean> {
        try {
            const response = await isInstalled();
            return response.result.isInstalled;
        } catch (error) {
            console.error("Error checking GemWallet installation:", error);
            return false;
        }
    }

    async connect(): Promise<WalletInfo> {
        if (!await this.isInstalled()) {
            throw new Error('GemWallet not installed');
        }

        try {
            // Get public key and address
            const publicKeyResponse = await getPublicKey();

            if (publicKeyResponse.type === "reject" || !publicKeyResponse.result) {
                throw new Error('Failed to get public key from GemWallet');
            }

            // Get network information
            const networkResponse = await getNetwork();

            if (networkResponse.type === "reject" || !networkResponse.result) {
                throw new Error('Failed to get network information from GemWallet');
            }

            this.connected = true;

            return {
                address: publicKeyResponse.result.address,
                publicKey: publicKeyResponse.result.publicKey,
                network: networkResponse.result.network
            };
        } catch (error) {
            console.error("Error connecting to GemWallet:", error);
            throw new Error('Failed to connect to GemWallet');
        }
    }

    async sign(message: string): Promise<string> {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            const response = await gemSignMessage(message);

            if (response.type === "reject" || !response.result) {
                throw new Error('Message signing rejected');
            }

            return response.result.signedMessage;
        } catch (error) {
            console.error("Error signing message:", error);
            throw new Error('Failed to sign message');
        }
    }

    async signAndSubmit(transaction: any): Promise<any> {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            // Handle payment transactions
            if (transaction.TransactionType === 'Payment') {
                const response = await sendPayment({
                    amount: transaction.Amount,
                    destination: transaction.Destination,
                    destinationTag: transaction.DestinationTag,
                    fee: transaction.Fee,
                    flags: transaction.Flags,
                    memos: transaction.Memos
                });

                if (response.type === "reject" || !response.result) {
                    throw new Error('Transaction rejected');
                }

                return response;
            }

            // Handle NFT minting transactions
            if (transaction.TransactionType === 'NFTokenMint') {
                // Process NFT flags if they're provided as an object
                if (typeof transaction.Flags === 'object') {
                    transaction.Flags = this.processNFTFlags(transaction.Flags);
                }

                const response = await submitTransaction({
                    transaction: {
                        TransactionType: 'NFTokenMint',
                        Account: transaction.Account || transaction.Issuer,
                        NFTokenTaxon: transaction.NFTokenTaxon,
                        Flags: transaction.Flags,
                        Issuer: transaction.Issuer,
                        TransferFee: transaction.TransferFee,
                        URI: transaction.URI,
                        Memos: transaction.Memos,
                        Fee: transaction.Fee
                    }
                });

                if (response.type === "reject" || !response.result) {
                    throw new Error('NFT minting rejected');
                }

                return response;
            }

            // Add support for other transaction types as needed
            throw new Error('Unsupported transaction type');
        } catch (error) {
            console.error("Error in signAndSubmit:", error);
            throw new Error('Transaction signing or submission failed');
        }
    }

    private processNFTFlags(flags: MintNFTFlags): number {
        let processedFlags = 0;
        if (flags.tfBurnable) processedFlags |= 0x00000001;
        if (flags.tfOnlyXRP) processedFlags |= 0x00000002;
        if (flags.tfTrustLine) processedFlags |= 0x00000004;
        if (flags.tfTransferable) processedFlags |= 0x00000008;

        return processedFlags;
    }



    async disconnect(): Promise<void> {
        // GemWallet doesn't have a explicit disconnect method according to the docs
        // We'll just reset our internal state
        this.connected = false;
    }

    async getAddress(): Promise<string> {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            const response = await getAddress();

            if (response.type === "reject" || !response.result) {
                throw new Error('Failed to get address');
            }

            return response.result.address;
        } catch (error) {
            console.error("Error getting address:", error);
            throw new Error('Failed to get address');
        }
    }
}