import { TokenIssuanceData } from "../../core/types";
interface CurrencyValidationResult {
    isValid: boolean;
    type: 'standard' | 'nonstandard' | 'invalid';
    error?: string;
}
interface TrustSetAmount {
    currency: string;
    issuer: string;
    value: string;
}
export declare class CurrencyCodeValidator {
    static STANDARD_LENGTH: number;
    static NONSTANDARD_LENGTH: number;
    static ALLOWED_SPECIAL_CHARS: string[];
    static validateCurrencyCode(code: string): CurrencyValidationResult;
    static convertToHex(code: string): string;
    static convertFromHex(hex: string): string;
    private static validateStandardCode;
    private static validateNonstandardCode;
    static validateForIssuance(config: TokenIssuanceData): void;
}
export declare class TrustSetHandler {
    static createLimitAmount(currencyCode: string, issuer: string, value: string): TrustSetAmount;
}
export {};
