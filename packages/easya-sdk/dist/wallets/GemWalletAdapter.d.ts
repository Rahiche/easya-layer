import { WalletAdapter, WalletInfo } from "../core/types";
export declare class GemWalletAdapter implements WalletAdapter {
    private connected;
    isInstalled(): Promise<boolean>;
    connect(): Promise<WalletInfo>;
    sign(message: string): Promise<string>;
    signAndSubmit(transaction: any): Promise<any>;
    private processNFTFlags;
    disconnect(): Promise<void>;
    getAddress(): Promise<string>;
}
