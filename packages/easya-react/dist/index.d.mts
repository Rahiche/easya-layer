import React, { ReactNode } from 'react';
import { EasyaConfig, NFT, TransactionResult, Balance } from 'easya-sdk-core/dist/core/types';
import { EasyaSDK } from 'easya-sdk-core';

interface BalanceDisplayProps {
    className?: string;
    refreshInterval?: number | null;
}
declare const BalanceDisplay: React.FC<BalanceDisplayProps>;

interface ConnectButtonProps {
    className?: string;
}
declare const ConnectButton: React.FC<ConnectButtonProps>;

interface MintNFTButtonProps {
    className?: string;
}
declare const MintNFTButton: React.FC<MintNFTButtonProps>;

interface FieldConfig {
    show: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
}
interface NFTFormConfig {
    showMetadataGenerator: boolean;
    nftURI: FieldConfig;
    nftTaxon: FieldConfig;
    nftTransferFee: FieldConfig;
    nftFlags: FieldConfig;
    imageUrl: FieldConfig;
    name: FieldConfig;
    description: FieldConfig;
}
interface NFTMintingFormProps {
    config?: Partial<NFTFormConfig>;
}
declare const NFTMintingForm: React.FC<NFTMintingFormProps>;

declare const TransactionForm: React.FC;

interface TransactionStatusProps {
    status: string;
    isLoading?: boolean;
}
declare const TransactionStatus: React.FC<TransactionStatusProps>;

interface AddressDisplayProps {
    className?: string;
    refreshInterval?: number;
}
declare const AddressDisplay: React.FC<AddressDisplayProps>;

declare const NFTTransferForm: React.FC;

interface NFTGalleryProps {
    className?: string;
}
declare const NFTGallery: React.FC<NFTGalleryProps>;

interface ConfigSelectorProps {
    currentConfig: EasyaConfig;
    onConfigChange: (newConfig: EasyaConfig) => void;
}
declare const ConfigSelector: React.FC<ConfigSelectorProps>;

declare const EventDisplay: React.FC;

declare const TrustLineForm: React.FC;

interface BalancesDisplayProps {
    className?: string;
    refreshInterval?: number | null;
}
declare const BalancesDisplay: React.FC<BalancesDisplayProps>;

declare const IssueTokenForm: React.FC;

interface BlockchainValues {
    recipientAddress: string;
    transactionAmount: string;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply: string;
    nftName: string;
    nftDescription: string;
    nftImage: string;
    nftURI: string | null;
    nftTaxon: string;
    nftTransferFee: string;
    nftFlags: string;
    selectedCurrency: string;
    currency: string;
    issuerAddress: string;
    trustLineLimit: string;
    currencyCode: string;
    amount: string;
    transferRate: string;
    tickSize: string;
    domain: string;
    requireDestTag: boolean;
    disallowXRP: boolean;
    generateColdWallet: boolean;
    coldWalletAddress?: string;
    coldWalletSecret?: string;
}
declare enum ConnectionStatus {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    DISCONNECTING = "disconnecting",
    CONNECTING = "connecting",
    FIALED = "failed"
}
interface BlockchainContextType {
    connectionStatus: ConnectionStatus;
    transactionStatus: string;
    values: BlockchainValues;
    updateValue: (key: keyof BlockchainValues, value: any) => void;
    connectToBlockchain: () => Promise<boolean>;
    disconnectFromBlockchain: () => Promise<boolean>;
    sendTransaction: () => Promise<void>;
    mintNFT: () => Promise<void>;
    getBalance: () => Promise<string>;
    getCurrencySymbol: () => Promise<string>;
    getAddress: () => Promise<string>;
    getNFTs: () => Promise<NFT[]>;
    transferNFT: (tokenId: string, to: string) => Promise<TransactionResult | null>;
    checkWalletInstalled: () => Promise<boolean>;
    subscribeToEvents: (eventName: string, callback: (data: any) => void) => Promise<void>;
    unsubscribeFromEvents: (eventName: string) => Promise<void>;
    createTrustLine: () => Promise<void>;
    getBalances: () => Promise<Balance[]>;
    issueToken: () => Promise<void>;
    sdk: EasyaSDK | null;
}

declare const BlockchainProvider: React.FC<{
    config: EasyaConfig;
    children: ReactNode;
}>;
declare const useBlockchain: () => BlockchainContextType;

export { AddressDisplay, BalanceDisplay, BalancesDisplay, BlockchainProvider, ConfigSelector, ConnectButton, EventDisplay, IssueTokenForm, MintNFTButton, NFTGallery, NFTMintingForm, NFTTransferForm, TransactionForm, TransactionStatus, TrustLineForm, useBlockchain };
