// BlockchainContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EasyaSDK } from '../../../../src';
import { BlockchainContextType, BlockchainValues } from '../components/types';
import { mintNFT, sendTransaction, getBalance, getCurrencySymbol, getAddress, getNFTs, transferNFT, checkWalletInstalled } from './blockchainService';
import { ConnectionConfig, EasyaConfig } from '../../../../src/core/types';

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export const BlockchainProvider: React.FC<{
    config: EasyaConfig;
    children: React.ReactNode;
  }> = ({ config, children }) => {    const [connectionStatus, setConnectionStatus] = useState<string>('Not Connected');
    const [sdk] = useState<EasyaSDK>(new EasyaSDK(config));
    const [transactionStatus, setTransactionStatus] = useState<string>('');
    const [values, setValues] = useState<BlockchainValues>({
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
    });

    const updateValue = (key: keyof BlockchainValues, value: string): void => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    const connectToBlockchain = async (): Promise<boolean> => {
        setConnectionStatus('Initialized');
        try {
            setConnectionStatus('Connecting...');
            const result = await sdk.connect();
            setConnectionStatus(`Connected`);
            return true;
        } catch (error) {
            setConnectionStatus(`Connection failed: ${error}`);
            return false;
        }
    };

    const disconnectFromBlockchain = async (): Promise<boolean> => {
        console.log(`sdk ${sdk}`);
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
            // Reset values to initial state
            setValues({
                recipientAddress: '',
                transactionAmount: '',
                tokenName: '',
                tokenSymbol: '',
                tokenSupply: '',
                nftName: '',
                nftDescription: '',
                nftURI: null,
                nftTaxon: '',
                nftTransferFee: '',
                nftFlags: '',
            });
            return true;
        } catch (error) {
            setConnectionStatus(`Disconnect failed: ${error}`);
            return false;
        }
    };

    return (
        <BlockchainContext.Provider value={{
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
        }}>
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