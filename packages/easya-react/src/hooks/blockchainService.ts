import { EasyaSDK } from '@easya/layer-js';
import { BlockchainValues } from '../components/types';
import { Balance, NFT, NFTConfig, TokenIssuanceData, TransactionResult } from '@easya/layer-js/dist/core/types';


export const issueToken = async (
    sdk: EasyaSDK,
    values: BlockchainValues,
    setTransactionStatus: (status: string) => void
): Promise<void> => {
    if (!sdk || !sdk.isActive()) {
        throw new Error('SDK not initialized or not connected');
    }

    try {
        setTransactionStatus('Processing');

        const tokenParams = {
            currencyCode: values.currencyCode,
            amount: values.amount,
            transferRate: parseFloat(values.transferRate),
            tickSize: parseInt(values.tickSize),
            ...(values.domain ? { domain: values.domain } : {}),
            requireDestTag: values.requireDestTag,
            disallowXRP: values.disallowXRP,
            generateColdWallet: values.generateColdWallet,
            ...((!values.generateColdWallet && values.coldWalletAddress) ? {
                coldWalletAddress: values.coldWalletAddress,
                coldWalletSecret: values.coldWalletSecret
            } : {})
        };

        await sdk.issueToken(tokenParams as TokenIssuanceData);
        setTransactionStatus('Success');

    } catch (error) {
        setTransactionStatus('Error');
        console.error('Token issuance error:', error);
        throw error;
    }
};

export const getBalances = async (sdk: EasyaSDK): Promise<Balance[]> => {
    try {
        if (!sdk || !sdk.isActive()) {
            throw new Error('SDK not initialized or not connected');
        }

        const balances = await sdk.getBalances();
        return Array.isArray(balances)
            ? balances.map(balance => ({
                currency: balance.currency || 'Native',
                value: balance.value?.toString() || '0',
                issuer: balance.issuer,
                nonStandard: balance.nonStandard,
            }))
            : [];
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw error;
    }
};

export const createTrustLine = async (
    sdk: EasyaSDK | null,
    values: BlockchainValues,
    setTransactionStatus: (status: string) => void
): Promise<void> => {
    if (!sdk) {
        throw new Error('SDK not initialized');
    }

    try {
        setTransactionStatus('Creating trust line...');

        const config = {
            currency: values.currency,
            issuer: values.issuerAddress,
            limit: values.trustLineLimit
        };

        const result = await sdk.createTrustLine(config);

        if (result) {
            setTransactionStatus('Trust line created successfully');
        } else {
            setTransactionStatus('Failed to create trust line');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTransactionStatus(`Failed to create trust line: ${errorMessage}`);
        throw error;
    }
};

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

        if (values.selectedCurrency != "") {
            const issuer = await sdk.getAddress();

            console.log('values', values);
            console.log('issuer', issuer);
            const result = await sdk.sendTransaction({
                to: values.recipientAddress,
                amount: values.transactionAmount,
                currency: values.selectedCurrency,
                issuer: issuer,
            });
            setTransactionStatus(`Transaction sent successfully! Hash: ${result.hash}`);
        } else {
            const result = await sdk.sendTransaction({
                to: values.recipientAddress,
                amount: amountInDrops
            });

            setTransactionStatus(`Transaction sent successfully! Hash: ${result.hash}`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTransactionStatus(`Transaction failed: ${errorMessage}`);
        console.error('Transaction error:', errorMessage);
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