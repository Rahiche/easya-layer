import { EasyaSDK } from "../../../../src";
import { NFT, TransactionResult } from "../../../../src/core/types";


export interface BlockchainValues {
  recipientAddress: string;
  transactionAmount: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  nftName: string;
  nftImage: string;
  nftDescription: string;
  nftURI: any;
  nftTaxon: string;
  nftTransferFee: string;
  nftFlags: string;
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
  sdk: EasyaSDK | null;
}