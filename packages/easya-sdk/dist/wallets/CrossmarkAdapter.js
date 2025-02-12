"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossmarkAdapter = void 0;
const sdk_1 = __importDefault(require("@crossmarkio/sdk"));
class CrossmarkAdapter {
    async isInstalled() {
        var _a;
        return (_a = sdk_1.default.sync.isInstalled()) !== null && _a !== void 0 ? _a : false;
    }
    async connect() {
        var _a;
        const { response } = await sdk_1.default.methods.signInAndWait();
        if (!((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.address)) {
            throw new Error('Failed to connect to Crossmark wallet');
        }
        return {
            address: response.data.address,
            publicKey: response.data.publicKey
        };
    }
    async sign(message) {
        const response = sdk_1.default.methods.sign(message);
        if (!response)
            throw new Error('Signing failed');
        return response;
    }
    async signAndSubmit(transaction) {
        const { response } = await sdk_1.default.methods.signAndSubmitAndWait(transaction);
        if (!response || !response.data) {
            throw new Error('Transaction signing or submission failed');
        }
        return response;
    }
    async disconnect() {
        // Crossmark doesn't have a specific disconnect method
        return;
    }
}
exports.CrossmarkAdapter = CrossmarkAdapter;
