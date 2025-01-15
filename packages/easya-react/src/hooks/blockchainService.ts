import { EasyaSDK } from '../../../../src';
import { NFT, NFTConfig, TransactionResult } from '../../../../src/core/types';
import { BlockchainValues } from '../components/types';

export const checkWalletInstalled = async (sdk: EasyaSDK | null): Promise<boolean> => {
    if (!sdk) {
        return false;
    }
    return sdk.isWalletInstalled();
}

export const transferNFT = async (
    sdk: EasyaSDK | null, 
    tokenId: string,
    to: string,
    setTransactionStatus: (status: string) => void
): Promise<TransactionResult> => {
    if (!sdk) {
        throw new Error('SDK not initialized');
    }

    try {
        setTransactionStatus('Transferring NFT...');
        const result = await sdk.transferNFT(tokenId, to);
        setTransactionStatus('NFT Transfer successful');
        return result;
    } catch (error) {
        setTransactionStatus(`NFT Transfer failed: ${error}`);
        throw error;
    }
};

export const mintNFT = async (sdk: EasyaSDK | null, values: BlockchainValues, setTransactionStatus: (status: string) => void): Promise<void> => {
    if (!sdk) {
        setTransactionStatus('Please connect to blockchain first');
        return;
    }

    try {
        setTransactionStatus('Preparing NFT minting...');

        // Validate inputs
        if (!values.nftURI) {
            throw new Error('NFT URI is required');
        }

        const taxon = parseInt(values.nftTaxon);
        if (isNaN(taxon)) {
            throw new Error('Invalid NFT taxon');
        }

        const transferFee = parseInt(values.nftTransferFee);
        if (isNaN(transferFee) || transferFee < 0 || transferFee > 50000) {
            throw new Error('Transfer fee must be between 0 and 50000');
        }

        const flags = parseInt(values.nftFlags);
        if (isNaN(flags)) {
            throw new Error('Invalid flags value');
        }

        setTransactionStatus('Minting NFT...');

        const nftConfig: NFTConfig = {
            URI: values.nftURI,
            name: values.nftName,
            description: values.nftDescription,
            image: "values.",
            taxon: taxon,
            transferFee: transferFee,
            flags: flags
        };

        const result = await sdk.mintNFT(nftConfig);
        setTransactionStatus(`NFT minted successfully! Transaction hash: ${result.hash}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTransactionStatus(`NFT minting failed: ${errorMessage}`);
        console.error('NFT minting error:', error);
    }
};

export const sendTransaction = async (sdk: EasyaSDK | null, values: BlockchainValues, setTransactionStatus: (status: string) => void): Promise<void> => {
    if (!sdk) {
        setTransactionStatus('Please connect to blockchain first');
        return;
    }

    try {
        // Input validation
        if (!values.recipientAddress) {
            throw new Error('Recipient address is required');
        }
        if (!values.transactionAmount || parseFloat(values.transactionAmount) <= 0) {
            throw new Error('Valid amount is required');
        }

        setTransactionStatus('Preparing transaction...');

        const amountInDrops = (parseFloat(values.transactionAmount)).toString();

        const result = await sdk.sendTransaction({
            to: values.recipientAddress,
            amount: amountInDrops
        });

        setTransactionStatus(`Transaction sent successfully! Hash: ${result.hash}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTransactionStatus(`Transaction failed: ${errorMessage}`);
        console.error('Transaction error:', error);
    }
};

export const getBalance = async (sdk: EasyaSDK | null): Promise<string> => {
    if (!sdk) {
        throw new Error('Not connected to blockchain');
    }

    try {
        const balance = await sdk.getBalance();
        const balanceInXRP = (balance / 1000000).toFixed(6);
        return balanceInXRP;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching balance:', errorMessage);
        throw new Error(`Failed to fetch balance: ${errorMessage}`);
    }
};

export const getCurrencySymbol = async (sdk: EasyaSDK | null): Promise<string> => {
    if (!sdk) {
        throw new Error('Not connected to blockchain');
    }

    try {
        const currencySymbol = await sdk.getCurrencySymbol();
        return currencySymbol;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching currency symbol:', errorMessage);
        throw new Error(`Failed to fetch currency symbol: ${errorMessage}`);
    }
};

export const getAddress = async (sdk: EasyaSDK | null): Promise<string> => {
    if (!sdk) {
        throw new Error('Not connected to blockchain');
    }

    try {
        const address = await sdk.getAddress();
        return address;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching address:', errorMessage);
        throw new Error(`Failed to fetch address: ${errorMessage}`);
    }
};

export const getNFTs = async (sdk: EasyaSDK | null): Promise<NFT[]> => {
    if (!sdk) {
        throw new Error('Not connected to blockchain');
    }

    try {
        const nfts = await sdk.getNFTs();
        return nfts;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching NFTs:', errorMessage);
        throw new Error(`Failed to fetch NFTs: ${errorMessage}`);
    }
};