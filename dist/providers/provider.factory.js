"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const xrpl_provider_1 = require("../providers/xrpl.provider");
class ProviderFactory {
    static createProvider(blockchain, network) {
        switch (blockchain.toLowerCase()) {
            case 'xrpl':
                return new xrpl_provider_1.XRPLProvider(network);
            default:
                throw new Error(`Unsupported blockchain: ${blockchain}`);
        }
    }
}
exports.ProviderFactory = ProviderFactory;
