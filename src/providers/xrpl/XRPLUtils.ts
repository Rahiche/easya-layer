import { dropsToXrp, xrpToDrops } from "xrpl";

export interface XRPLUtils {
    stringToHex(str: string): string;
    hexToString(hex: string): string;
    dropsToXRP(drops: string): string;
    xrpToDrops(xrp: string): string;
    fetchNFTMetadata(uri: string): Promise<any>;
}

export class XRPLUtilities implements XRPLUtils {
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
}

export const xrplUtils = new XRPLUtilities();