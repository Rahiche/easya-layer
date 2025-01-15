import { EasyaConfig, NFT, NFTConfig, TransactionConfig, TransactionResult } from './core/types';
import { BlockchainProvider } from './core/types';
import { ProviderFactory } from './providers/provider.factory';

export class EasyaSDK {
  public config: EasyaConfig;
  public provider: BlockchainProvider;
  private isConnected: boolean = false;
  public currentAddress: string | null = null;

  constructor(config: EasyaConfig) {
      this.config = {
          network: config.network || 'testnet',
          blockchain: config.blockchain || 'aptos',
      };

      this.provider = ProviderFactory.createProvider(
          this.config.blockchain,
          this.config.network,
      );
  }

  async connect(): Promise<string> {
    try {
      const result = await this.provider.connect();
      this.isConnected = true;

      // Fetch and store the address after successful connection
      try {
        const walletInfo = await this.provider.getWalletInfo();
        this.currentAddress = walletInfo.address;
      } catch (error) {
        console.warn('Failed to fetch wallet address during connection:', error);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected');
      }
      await this.provider.disconnect();
      this.isConnected = false;
      this.currentAddress = null; // Clear the stored address
    } catch (error) {
      throw new Error(`Failed to disconnect: ${error}`);
    }
  }

  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Sends a transaction using the configured blockchain provider
   * @param config Transaction configuration parameters
   * @returns Promise containing the transaction result
   * @throws Error if not connected or if transaction fails
   */
  async sendTransaction(config: TransactionConfig) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Validate transaction config
      this.validateTransactionConfig(config);

      const amountInDrops = (parseFloat(config.amount)).toString();
      const transactionConfig = {
        ...config,
        amount: amountInDrops
      };

      // Call provider's sendTransaction method
      const result = await this.provider.sendTransaction(transactionConfig);
      return result;
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`);
    }
  }

  /**
   * Validates transaction configuration parameters
   * @param config Transaction configuration to validate
   * @throws Error if config is invalid
   */
  private validateTransactionConfig(config: TransactionConfig) {
    if (!config) {
      throw new Error('Transaction configuration is required');
    }

    if (!config.to) {
      throw new Error('Recipient address is required');
    }

    if (!config.amount || parseFloat(config.amount) <= 0) {
      throw new Error('Valid amount is required');
    }
  }

  /**
   * Mints a new NFT using the configured blockchain provider
   * @param config NFT configuration parameters
   * @returns Promise containing the transaction result
   * @throws Error if not connected or if minting fails
   */
  async mintNFT(config: NFTConfig) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Validate NFT config
      this.validateNFTConfig(config);

      // Call provider's mintNFT method
      const result = await this.provider.mintNFT(config);
      return result;
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error}`);
    }
  }

  /**
   * Validates NFT configuration parameters
   * @param config NFT configuration to validate
   * @throws Error if config is invalid
   */
  private validateNFTConfig(config: NFTConfig) {
    if (!config) {
      throw new Error('NFT configuration is required');
    }

    if (!config.URI) {
      throw new Error('NFT URI is required');
    }

    if (typeof config.taxon !== 'number') {
      throw new Error('NFT taxon must be a number');
    }

    if (config.transferFee !== undefined &&
      (config.transferFee < 0 || config.transferFee > 50000)) {
      throw new Error('Transfer fee must be between 0 and 50000');
    }
  }

  /**
   * Gets the balance for a given address or the connected wallet
   * @param address Optional address to check balance for
   * @returns Promise containing the balance as a number
   * @throws Error if not connected or if balance check fails
   */
  async getBalance(address?: string): Promise<number> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Use provided address or fall back to cached address
      const targetAddress = address || this.currentAddress;
      if (!targetAddress) {
        throw new Error('No address provided and no cached address available');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return balance;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  getCurrencySymbol(): string {
    switch (this.config.blockchain.toLowerCase()) {
      case 'xrpl':
        return 'XRP';
      case 'aptos': 
        return 'APT';
      default:
        throw new Error(`Unsupported blockchain: ${this.config.blockchain}`);
    }
  }

  /**
   * Gets the cached address of the connected wallet or fetches it if not cached
   * @returns Promise containing the wallet address as a string
   * @throws Error if not connected or if address retrieval fails
   */
  async getAddress(): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Return cached address if available
      if (this.currentAddress) {
        return this.currentAddress;
      }

      // Fetch and cache address if not available
      const walletInfo = await this.provider.getWalletInfo();
      this.currentAddress = walletInfo.address;
      return this.currentAddress;
    } catch (error) {
      throw new Error(`Failed to get address: ${error}`);
    }
  }

  async getNFTs(address?: string): Promise<NFT[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Use provided address or fall back to cached address
      const targetAddress = address || this.currentAddress;
      if (!targetAddress) {
        throw new Error('No address provided and no cached address available');
      }

      const nfts = await this.provider.getNFTs(targetAddress);
      return nfts.map(nft => ({
        ...nft,
        price: nft.price ? `${nft.price} ${this.getCurrencySymbol()}` : 'Not for sale'
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching NFTs:', errorMessage);
      throw new Error(`Failed to fetch NFTs: ${errorMessage}`);
    }
  }

  async transferNFT(tokenId: string, to: string): Promise<TransactionResult> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to network');
      }

      // Validate parameters
      this.validateTransferNFTParams(tokenId, to);

      // Call provider's transferNFT method
      const result = await this.provider.transferNFT(tokenId, to);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error transferring NFT:', errorMessage);
      throw new Error(`Failed to transfer NFT: ${errorMessage}`);
    }
  }

  async isWalletInstalled(): Promise<boolean> {
    try {
      return await this.provider.isWalletInstalled();
    } catch (error) {
      console.warn('Error checking wallet installation:', error);
      return false;
    }
  }


  private validateTransferNFTParams(tokenId: string, to: string) {
    if (!tokenId || typeof tokenId !== 'string' || tokenId.trim() === '') {
      throw new Error('Valid token ID is required');
    }

    if (!to || typeof to !== 'string' || to.trim() === '') {
      throw new Error('Valid recipient address is required');
    }

    // Additional blockchain-specific address validation could be added here
    if (this.config.blockchain.toLowerCase() === 'xrpl') {
      if (!to.startsWith('r') || to.length !== 34) {
        throw new Error('Invalid XRPL address format');
      }
    }
  }
}