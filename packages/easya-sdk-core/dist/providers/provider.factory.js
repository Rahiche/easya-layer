"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const aptos_provider_1 = require("./aptos/aptos.provider");
const xrpl_provider_1 = require("./xrpl/xrpl.provider");
class ProviderFactory {
    static createProvider(blockchain, network, wallet) {
        switch (blockchain.toLowerCase()) {
            case 'xrpl':
                return new xrpl_provider_1.XRPLProvider(wallet, network);
            case 'aptos':
                return new aptos_provider_1.AptosProvider(network);
            default:
                throw new Error(`Unsupported blockchain: ${blockchain}`);
        }
    }
}
exports.ProviderFactory = ProviderFactory;
