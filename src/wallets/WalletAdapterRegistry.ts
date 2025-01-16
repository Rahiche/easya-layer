import { WalletAdapter } from "../core/types";

export class WalletAdapterRegistry {
    private static instance: WalletAdapterRegistry;
    private adapters: Map<string, WalletAdapter> = new Map();

    private constructor() {
        
    }

    static getInstance(): WalletAdapterRegistry {
        if (!WalletAdapterRegistry.instance) {
            WalletAdapterRegistry.instance = new WalletAdapterRegistry();
        }
        return WalletAdapterRegistry.instance;
    }

    registerAdapter(name: string, adapter: WalletAdapter): void {
        this.adapters.set(name.toLowerCase(), adapter);
    }

    getAdapter(name: string): WalletAdapter {
        const adapter = this.adapters.get(name.toLowerCase());
        if (!adapter) {
            throw new Error(`Wallet adapter '${name}' not found`);
        }
        return adapter;
    }

    getAvailableWallets(): string[] {
        return Array.from(this.adapters.keys());
    }
}