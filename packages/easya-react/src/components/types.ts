import { EasyaSDK } from "../../../../src";
import { Balance, NFT, TokenIssuanceData, TransactionResult } from "../../../../src/core/types";


export interface BlockchainValues {
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
  // New token issuance values
  currencyCode: string;
  amount: string;
  transferRate: string;
  tickSize: string;
  domain: string;
  requireDestTag: boolean;
  disallowXRP: boolean;
}


export interface BlockchainContextType {
  connectionStatus: string;
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