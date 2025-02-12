import sdk from '@crossmarkio/sdk';
import { WalletAdapter, WalletInfo } from '../core/types';

export class CrossmarkAdapter implements WalletAdapter {
    async isInstalled(): Promise<boolean> {
        return sdk.sync.isInstalled() ?? false;
    }

    async connect(): Promise<WalletInfo> {
        const { response } = await sdk.methods.signInAndWait();
        if (!response?.data?.address) {
            throw new Error('Failed to connect to Crossmark wallet');
        }

        return {
            address: response.data.address,
            publicKey: response.data.publicKey
        };
    }

    async sign(message: string): Promise<string> {
        const response =  sdk.methods.sign(message as any);
        if (!response) throw new Error('Signing failed');
        return response;
    }

    async signAndSubmit(transaction: any): Promise<any> {
        const { response } = await sdk.methods.signAndSubmitAndWait(transaction);
        if (!response || !response.data) {
            throw new Error('Transaction signing or submission failed');
        }
        return response;
    }

    async disconnect(): Promise<void> {
        // Crossmark doesn't have a specific disconnect method
        return;
    }
}