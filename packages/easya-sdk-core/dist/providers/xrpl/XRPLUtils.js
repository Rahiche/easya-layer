"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrencyAmount = exports.validateCurrencyTransactionConfig = exports.validateTrustLineConfig = exports.XRPLUtils = void 0;
const xrpl_1 = require("xrpl");
const currencyCodeValidator_1 = require("./currencyCodeValidator");
class XRPLUtils {
    constructor(client) {
        this.client = client;
    }
    stringToHex(str) {
        return Array.from(new TextEncoder().encode(str))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    hexToString(hex) {
        var _a;
        const bytes = new Uint8Array(((_a = hex.match(/.{1,2}/g)) === null || _a === void 0 ? void 0 : _a.map(byte => parseInt(byte, 16))) || []);
        return new TextDecoder().decode(bytes);
    }
    dropsToXRP(drops) {
        return (0, xrpl_1.dropsToXrp)(drops).toString();
    }
    xrpToDrops(xrp) {
        return (0, xrpl_1.xrpToDrops)(xrp);
    }
    async fetchNFTMetadata(uri) {
        try {
            const url = uri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri;
            const response = await fetch(url);
            return await response.json();
        }
        catch (error) {
            console.warn(`Failed to fetch metadata from ${uri}: ${error}`);
            return {};
        }
    }
    async checkTrustLine(address, currency, issuer) {
        console.log(`Checking trust line for - Address: ${address}, Currency: ${currency}, Issuer: ${issuer}`);
        if (!address || !currency || !issuer) {
            console.log('Missing required parameters');
            throw new Error('Address, currency, and issuer are required parameters');
        }
        try {
            const request = {
                command: 'account_lines',
                account: address,
                peer: issuer,
            };
            console.log('Sending account_lines request:', request);
            const response = await this.client.request(request);
            console.log('Received response:', response);
            // Check if there are any trust lines
            if (!response.result.lines || response.result.lines.length === 0) {
                console.log('No trust lines found');
                return false;
            }
            const nonStdCurrencyCode = currencyCodeValidator_1.CurrencyCodeValidator.convertToHex(currency);
            console.log(`nonStdCurrencyCode: ${nonStdCurrencyCode}`);
            const hasTrustLine = response.result.lines.some(line => (line.currency === currency || line.currency === nonStdCurrencyCode) &&
                (line.limit !== '0' || line.limit_peer !== '0'));
            console.log(`Trust line found: ${hasTrustLine}`);
            return hasTrustLine;
        }
        catch (error) {
            console.error('Error checking trust line:', error);
            throw new Error(`Failed to check trust line: ${error}`);
        }
    }
}
exports.XRPLUtils = XRPLUtils;
// Add these validation methods to the class
function validateTrustLineConfig(config) {
    if (!config) {
        throw new Error('Trust line configuration is required');
    }
    if (!config.currency) {
        throw new Error('Currency is required for trust line');
    }
    if (!config.issuer) {
        throw new Error('Issuer address is required for trust line');
    }
    if (typeof config.limit !== 'string' && typeof config.limit !== 'number') {
        throw new Error('Trust line limit must be a valid number or string');
    }
}
exports.validateTrustLineConfig = validateTrustLineConfig;
function validateCurrencyTransactionConfig(config) {
    if (!config) {
        throw new Error('Currency transaction configuration is required');
    }
    // if (!config.to) {
    //     throw new Error('Recipient address is required');
    // }
    if (!config.currency) {
        throw new Error('Currency code is required');
    }
    if (!config.issuer) {
        throw new Error('Currency issuer address is required');
    }
    if (!config.amount || isNaN(Number(config.amount))) {
        throw new Error('Valid amount is required');
    }
}
exports.validateCurrencyTransactionConfig = validateCurrencyTransactionConfig;
function formatCurrencyAmount(amount) {
    // Convert to string and ensure proper decimal format
    return typeof amount === 'number' ? amount.toString() : amount;
}
exports.formatCurrencyAmount = formatCurrencyAmount;
