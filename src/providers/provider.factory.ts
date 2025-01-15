
import { BlockchainProvider } from '../core/types';
import { XRPLProvider } from '../providers/xrpl.provider';

export class ProviderFactory {
  static createProvider(blockchain: string, network: string): BlockchainProvider {
    switch (blockchain.toLowerCase()) {
      case 'xrpl':
        return new XRPLProvider(network);
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }
}