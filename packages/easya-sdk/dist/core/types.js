"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCallback = exports.BlockchainEvent = void 0;
class BlockchainEvent {
    constructor(type, data, network, timestamp) {
        this.type = type;
        this.data = data;
        this.timestamp = timestamp || Date.now();
        this.network = network || 'unknown';
    }
    // Factory methods for common event types
    static createLedgerEvent(network, ledgerIndex, ledgerHash, totalTransactions, closeTime) {
        return new BlockchainEvent('ledger', {
            ledgerIndex,
            ledgerHash,
            totalTransactions,
            closeTime
        }, network);
    }
    static createTransactionEvent(network, hash, from, to, amount, status = 'pending', confirmations) {
        return new BlockchainEvent('transaction', {
            hash,
            from,
            to,
            amount,
            status,
            confirmations
        }, network);
    }
    static createNFTEvent(network, action, tokenId, from, to, price) {
        return new BlockchainEvent('nft', {
            action,
            tokenId,
            from,
            to,
            price
        }, network);
    }
    static createWalletEvent(network, action, address) {
        return new BlockchainEvent('wallet', {
            action,
            address
        }, network);
    }
    static createErrorEvent(network, code, message, originalError) {
        return new BlockchainEvent('error', {
            code,
            message,
            originalError
        }, network);
    }
    // Helper methods
    hasData(key) {
        return this.data && key in this.data;
    }
    getData(key, defaultValue) {
        return this.data && key in this.data ? this.data[key] : defaultValue;
    }
    // Type guard methods
    isLedgerEvent() {
        return this.type === 'ledger';
    }
    isTransactionEvent() {
        return this.type === 'transaction';
    }
    isNFTEvent() {
        return this.type === 'nft';
    }
    isWalletEvent() {
        return this.type === 'wallet';
    }
    isErrorEvent() {
        return this.type === 'error';
    }
}
exports.BlockchainEvent = BlockchainEvent;
class EventCallback {
    constructor(callback, options = {}) {
        this.callback = callback;
        this.filters = new Map();
        this.options = options;
    }
    // Add filters
    addFilter(name, filterFn) {
        this.filters.set(name, filterFn);
        return this;
    }
    // Remove filters
    removeFilter(name) {
        this.filters.delete(name);
        return this;
    }
    // Common filter factories
    static createTypeFilter(types) {
        return (event) => types.includes(event.type);
    }
    static createAddressFilter(addresses) {
        const lowerAddresses = addresses.map(addr => addr.toLowerCase());
        return (event) => {
            var _a, _b;
            if (event.hasData('from')) {
                const from = (_a = event.getData('from')) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (from && lowerAddresses.includes(from))
                    return true;
            }
            if (event.hasData('to')) {
                const to = (_b = event.getData('to')) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (to && lowerAddresses.includes(to))
                    return true;
            }
            return false;
        };
    }
    // Handle event with all filters and options applied
    async handleEvent(event) {
        // Check if event passes all filters
        for (const filter of this.filters.values()) {
            if (!filter(event))
                return;
        }
        // Apply debouncing if configured
        if (this.options.debounceMs) {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = setTimeout(() => {
                this.executeCallback(event);
            }, this.options.debounceMs);
            return;
        }
        await this.executeCallback(event);
    }
    // Execute the callback with retry logic
    async executeCallback(event) {
        let retries = 0;
        const maxRetries = this.options.maxRetries || 3;
        while (true) {
            try {
                await Promise.resolve(this.callback(event));
                break;
            }
            catch (error) {
                if (!this.options.retryOnError || retries >= maxRetries) {
                    throw error;
                }
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }
    // Clean up any pending timeouts
    cleanup() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
}
exports.EventCallback = EventCallback;
