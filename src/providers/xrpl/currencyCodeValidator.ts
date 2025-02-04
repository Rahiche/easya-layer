import { convertHexToString } from "xrpl";
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

export class CurrencyCodeValidator {
     static STANDARD_LENGTH = 3;
     static NONSTANDARD_LENGTH = 40;
     static ALLOWED_SPECIAL_CHARS = ['?', '!', '@', '#', '$', '%', '^', '&', '*', '<', '>', '(', ')', '{', '}', '[', ']', '|'];
    
    static validateCurrencyCode(code: string): CurrencyValidationResult {
        // Check if empty or undefined
        if (!code) {
            return {
                isValid: false,
                type: 'invalid',
                error: 'Currency code cannot be empty'
            };
        }

        // Check for standard currency code (3 characters)
        if (code.length === this.STANDARD_LENGTH) {
            return this.validateStandardCode(code);
        }

        // For non-standard codes, convert to hex if not already hex
        if (code.length !== this.NONSTANDARD_LENGTH) {
            code = this.convertToHex(code);
        }

        // Now validate as nonstandard code
        return this.validateNonstandardCode(code);
    }

     static convertToHex(code: string): string {
        // Convert string to hex and pad to 40 characters
        let hex = '';
        for (let i = 0; i < code.length; i++) {
            hex += code.charCodeAt(i).toString(16).padStart(2, '0');
        }
        
        // Pad or truncate to exactly 40 characters
        if (hex.length < this.NONSTANDARD_LENGTH) {
            hex = hex.padEnd(this.NONSTANDARD_LENGTH, '0');
        } else if (hex.length > this.NONSTANDARD_LENGTH) {
            hex = hex.substring(0, this.NONSTANDARD_LENGTH);
        }
        
        return hex.toUpperCase();
    }

    static convertFromHex(hex: string): string {
        return convertHexToString(hex);
    }
    
    private static validateStandardCode(code: string): CurrencyValidationResult {
        // Check if it's XRP (disallowed)
        if (code === 'XRP') {
            return {
                isValid: false,
                type: 'invalid',
                error: 'XRP is not allowed as a currency code'
            };
        }

        // Check if all characters are valid
        const isValid = [...code].every(char => 
            (char >= 'A' && char <= 'Z') ||
            (char >= 'a' && char <= 'z') ||
            (char >= '0' && char <= '9') ||
            this.ALLOWED_SPECIAL_CHARS.includes(char)
        );

        if (!isValid) {
            return {
                isValid: false,
                type: 'invalid',
                error: 'Standard currency code contains invalid characters'
            };
        }

        return {
            isValid: true,
            type: 'standard'
        };
    }

    private static validateNonstandardCode(code: string): CurrencyValidationResult {
        // Check if it's a valid hex string
        if (!/^[0-9A-Fa-f]+$/.test(code)) {
            return {
                isValid: false,
                type: 'invalid',
                error: 'Nonstandard currency code must be a valid hexadecimal string'
            };
        }

        // Check if the first byte is 0x00 (not allowed for nonstandard codes)
        if (code.substring(0, 2) === '00') {
            return {
                isValid: false,
                type: 'invalid',
                error: 'Nonstandard currency code cannot start with 0x00'
            };
        }

        return {
            isValid: true,
            type: 'nonstandard'
        };
    }

    static validateForIssuance(config: TokenIssuanceData): void {
        const validation = this.validateCurrencyCode(config.currencyCode);
        if (!validation.isValid) {
            throw new Error(`Invalid currency code: ${validation.error}`);
        }
    }
}

export class TrustSetHandler {
    static createLimitAmount(currencyCode: string, issuer: string, value: string): TrustSetAmount {
        const validation = CurrencyCodeValidator.validateCurrencyCode(currencyCode);
        
        if (!validation.isValid) {
            throw new Error(`Invalid currency code: ${validation.error}`);
        }

        let formattedCurrency: string;
        
        if (validation.type === 'standard') {
            // For standard 3-character codes, use as-is
            formattedCurrency = currencyCode;
        } else {
            // For nonstandard codes, convert to hex if not already in hex format
            formattedCurrency = currencyCode.length === CurrencyCodeValidator.NONSTANDARD_LENGTH 
                ? currencyCode.toUpperCase()
                : CurrencyCodeValidator.convertToHex(currencyCode);
        }

        return {
            currency: formattedCurrency,
            issuer: issuer,
            value: value
        };
    }
}

// Example usage:
/*
// Standard currency code
console.log(CurrencyCodeValidator.validateCurrencyCode('USD')); 
// { isValid: true, type: 'standard' }

// Non-standard currency code (will be converted to hex)
console.log(CurrencyCodeValidator.validateCurrencyCode('MyCustomToken')); 
// { isValid: true, type: 'nonstandard' }

// Already hex code
console.log(CurrencyCodeValidator.validateCurrencyCode('015841551A748AD2C1F76FF6ECB0CCCD00000000')); 
// { isValid: true, type: 'nonstandard' }
*/