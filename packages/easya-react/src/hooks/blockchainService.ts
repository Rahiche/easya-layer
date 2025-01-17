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
): Promise<TransactionResult | null> => {
    if (!sdk?.isActive()) {
        setTransactionStatus('Please connect to blockchain first');
        return null;
    }

    try {
        setTransactionStatus('Transferring NFT...');
        const result = await sdk.transferNFT(tokenId, to);
        setTransactionStatus('NFT Transfer successful');
        return result;
    } catch (error) {
        setTransactionStatus(`NFT Transfer failed: ${error}`);
        return null;
    }
};

export const mintNFT = async (sdk: EasyaSDK | null, values: BlockchainValues, setTransactionStatus: (status: string) => void): Promise<void> => {
    if (!sdk?.isActive()) {
        setTransactionStatus('Please connect to blockchain first');
        return;
    }

    try {
        setTransactionStatus('Preparing NFT minting...');

        // Validate inputs
        if (!values.nftURI) {
            setTransactionStatus('NFT URI is required');
            return;
        }

        const taxon = parseInt(values.nftTaxon);
        if (isNaN(taxon)) {
            setTransactionStatus('Invalid NFT taxon');
            return;
        }

        const transferFee = parseInt(values.nftTransferFee);
        if (isNaN(transferFee) || transferFee < 0 || transferFee > 50000) {
            setTransactionStatus('Transfer fee must be between 0 and 50000');
            return;
        }

        const flags = parseInt(values.nftFlags);
        if (isNaN(flags)) {
            setTransactionStatus('Invalid flags value');
            return;
        }

        setTransactionStatus('Minting NFT...');

        const nftConfig: NFTConfig = {
            URI: values.nftURI,
            name: values.nftName,
            description: values.nftDescription,
            image: values.nftImage,
            taxon: taxon,
            transferFee: transferFee,
            flags: flags
        };

        const result = await sdk.mintNFT(nftConfig);
        setTransactionStatus(`NFT minted successfully! ${result.nftID}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTransactionStatus(`NFT minting failed: ${errorMessage}`);
        console.error('NFT minting error:', error);
    }
};

export const sendTransaction = async (sdk: EasyaSDK | null, values: BlockchainValues, setTransactionStatus: (status: string) => void): Promise<void> => {
    if (!sdk?.isActive()) {
        setTransactionStatus('Please connect to blockchain first');
        return;
    }

    try {
        if (!values.recipientAddress) {
            setTransactionStatus('Recipient address is required');
            return;
        }
        if (!values.transactionAmount || parseFloat(values.transactionAmount) <= 0) {
            setTransactionStatus('Valid amount is required');
            return;
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
    console.log('sdk', sdk);
    if (!sdk?.isActive()) {
        return '0.000000';
    }

    try {
        const balance = await sdk.getBalance();
        const balanceInXRP = (balance / 1000000).toFixed(6);
        return balanceInXRP;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return '0.000000';
    }
};

export const getCurrencySymbol = async (sdk: EasyaSDK | null): Promise<string> => {
    if (!sdk?.isActive()) {
        return 'XRP';
    }

    try {
        const currencySymbol = await sdk.getCurrencySymbol();
        return currencySymbol;
    } catch (error) {
        console.error('Error fetching currency symbol:', error);
        return 'XRP';
    }
};

export const getAddress = async (sdk: EasyaSDK | null): Promise<string> => {
    if (!sdk?.isActive()) {
        return '';
    }

    try {
        const address = await sdk.getAddress();
        return address;
    } catch (error) {
        console.error('Error fetching address:', error);
        return '';
    }
};

export const getNFTs = async (sdk: EasyaSDK | null): Promise<NFT[]> => {
    if (!sdk?.isActive()) {
        return [];
    }

    try {
        const nfts = await sdk.getNFTs();
        return nfts;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return [];
    }
};