import { CurrencyTransactionConfig, TrustLineConfig } from "../../core/types";
import { Client } from 'xrpl';
export declare class XRPLUtils {
    private client;
    constructor(client: Client);
    stringToHex(str: string): string;
    hexToString(hex: string): string;
    dropsToXRP(drops: string): string;
    xrpToDrops(xrp: string): string;
    fetchNFTMetadata(uri: string): Promise<any>;
    checkTrustLine(address: string, currency: string, issuer: string): Promise<boolean>;
}
export declare function validateTrustLineConfig(config: TrustLineConfig): void;
export declare function validateCurrencyTransactionConfig(config: CurrencyTransactionConfig): void;
export declare function formatCurrencyAmount(amount: string | number): string;
