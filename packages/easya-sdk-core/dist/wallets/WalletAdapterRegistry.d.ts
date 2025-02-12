import { WalletAdapter } from "../core/types";
export declare class WalletAdapterRegistry {
    private static instance;
    private adapters;
    private constructor();
    static getInstance(): WalletAdapterRegistry;
    registerAdapter(name: string, adapter: WalletAdapter): void;
    getAdapter(name: string): WalletAdapter;
    getAvailableWallets(): string[];
}
