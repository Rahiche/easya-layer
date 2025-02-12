"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletAdapterRegistry = void 0;
class WalletAdapterRegistry {
    constructor() {
        this.adapters = new Map();
    }
    static getInstance() {
        if (!WalletAdapterRegistry.instance) {
            WalletAdapterRegistry.instance = new WalletAdapterRegistry();
        }
        return WalletAdapterRegistry.instance;
    }
    registerAdapter(name, adapter) {
        this.adapters.set(name.toLowerCase(), adapter);
    }
    getAdapter(name) {
        const adapter = this.adapters.get(name.toLowerCase());
        if (!adapter) {
            throw new Error(`Wallet adapter '${name}' not found`);
        }
        return adapter;
    }
    getAvailableWallets() {
        return Array.from(this.adapters.keys());
    }
}
exports.WalletAdapterRegistry = WalletAdapterRegistry;
