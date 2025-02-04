import { dropsToXrp, xrpToDrops } from "xrpl";
import { CurrencyTransactionConfig, TokenIssuanceData, TransactionResult, TrustLineConfig } from "../../core/types";
import { Client, AccountLinesRequest, AccountLinesResponse } from 'xrpl';
import { CurrencyCodeValidator } from "./currencyCodeValidator";


export class XRPLUtils {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    stringToHex(str: string): string {
        return Array.from(new TextEncoder().encode(str))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    hexToString(hex: string): string {
        const bytes = new Uint8Array(
            hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        return new TextDecoder().decode(bytes);
    }

    dropsToXRP(drops: string): string {
        return dropsToXrp(drops).toString();
    }

    xrpToDrops(xrp: string): string {
        return xrpToDrops(xrp);
    }

    async fetchNFTMetadata(uri: string): Promise<any> {
        try {
            const url = uri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to fetch metadata from ${uri}: ${error}`);
            return {};
        }
    }

    async checkTrustLine(address: string, currency: string, issuer: string): Promise<boolean> {
        if (!address || !currency || !issuer) {
            throw new Error('Address, currency, and issuer are required parameters');
        }

        try {
            const request: AccountLinesRequest = {
                command: 'account_lines',
                account: address,
                peer: issuer,
            };

            const response: AccountLinesResponse = await this.client.request(request);
            
            // Check if there are any trust lines
            if (!response.result.lines || response.result.lines.length === 0) {
                return false;
            }

            // Look for a trust line matching the currency
            return response.result.lines.some(line => 
                line.currency === currency && 
                (line.limit !== '0' || line.limit_peer !== '0')
            );
        } catch (error) {
            console.error('Error checking trust line:', error);
            throw new Error(`Failed to check trust line: ${error}`);
        }
    }

}

// Add these validation methods to the class
export function validateTrustLineConfig(config: TrustLineConfig): void {
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

export function validateCurrencyTransactionConfig(config: CurrencyTransactionConfig): void {
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

export function formatCurrencyAmount(amount: string | number): string {
    // Convert to string and ensure proper decimal format
    return typeof amount === 'number' ? amount.toString() : amount;
}
