// BlockchainContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EasyaSDK } from '../../../../src';
import { BlockchainContextType, BlockchainValues } from '../components/types';
import {
    mintNFT,
    sendTransaction,
    getBalance,
    getCurrencySymbol,
    getAddress,
    getNFTs,
    transferNFT,
    checkWalletInstalled
} from './blockchainService';
import { ConnectionConfig, EasyaConfig } from '../../../../src/core/types';

const BlockchainContext = createContext<BlockchainContextType | null>(null);

const initialValues: BlockchainValues = {
    recipientAddress: '',
    transactionAmount: '',
    tokenName: '',
    tokenSymbol: '',
    tokenSupply: '',
    nftName: '',
    nftDescription: '',
    nftURI: null,
    nftTaxon: '0',
    nftTransferFee: '0',
    nftFlags: '0'
};

export const BlockchainProvider: React.FC<{
    config: EasyaConfig;
    children: ReactNode;
}> = ({ config, children }) => {
    const [connectionStatus, setConnectionStatus] = useState<string>('Not Connected');
    const [sdk, setSdk] = useState<EasyaSDK>(() => new EasyaSDK(config));
    const [transactionStatus, setTransactionStatus] = useState<string>('');
    const [values, setValues] = useState<BlockchainValues>(initialValues);

    // Reset state and recreate SDK when config changes
    useEffect(() => {
        // Clean up previous connection if exists
        const cleanup = async () => {
            if (sdk && typeof sdk.disconnect === 'function') {
                try {
                    await sdk.disconnect();
                } catch (error) {
                    console.error('Error disconnecting:', error);
                }
            }
        };

        cleanup();

        // Reset all state
        setConnectionStatus('Not Connected');
        setTransactionStatus('');
        setValues(initialValues);

        // Create new SDK instance with new config
        setSdk(new EasyaSDK(config));
    }, [config]);

    const updateValue = (key: keyof BlockchainValues, value: string): void => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    const connectToBlockchain = async (): Promise<boolean> => {
        if (!sdk) return false;

        setConnectionStatus('Initialized');
        try {
            setConnectionStatus('Connecting...');
            const result = await sdk.connect();
            setConnectionStatus('Connected');
            return true;
        } catch (error) {
            setConnectionStatus(`Connection failed: ${error}`);
            return false;
        }
    };

    const disconnectFromBlockchain = async (): Promise<boolean> => {
        if (!sdk) {
            setConnectionStatus('Not Connected');
            return true;
        }

        try {
            setConnectionStatus('Disconnecting...');
            if (typeof sdk.disconnect === 'function') {
                await sdk.disconnect();
            }
            setConnectionStatus('Not Connected');
            setTransactionStatus('');
            setValues(initialValues);
            return true;
        } catch (error) {
            setConnectionStatus(`Disconnect failed: ${error}`);
            return false;
        }
    };

    const contextValue: BlockchainContextType = {
        connectionStatus,
        transactionStatus,
        values,
        updateValue,
        connectToBlockchain,
        disconnectFromBlockchain,
        sendTransaction: () => sendTransaction(sdk, values, setTransactionStatus),
        mintNFT: () => mintNFT(sdk, values, setTransactionStatus),
        getBalance: () => getBalance(sdk),
        getCurrencySymbol: () => getCurrencySymbol(sdk),
        getAddress: () => getAddress(sdk),
        getNFTs: () => getNFTs(sdk),
        transferNFT: (tokenId: string, to: string) => transferNFT(sdk, tokenId, to, setTransactionStatus),
        checkWalletInstalled: () => checkWalletInstalled(sdk),
        sdk
    };

    return (
        <BlockchainContext.Provider value={contextValue}>
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = (): BlockchainContextType => {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
};