import { WalletAdapter, WalletInfo } from '../core/types';
export declare class CrossmarkAdapter implements WalletAdapter {
    isInstalled(): Promise<boolean>;
    connect(): Promise<WalletInfo>;
    sign(message: string): Promise<string>;
    signAndSubmit(transaction: any): Promise<any>;
    disconnect(): Promise<void>;
}
