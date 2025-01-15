
import { BlockchainProvider } from '../core/types';
import { XRPLProvider } from '../providers/xrpl.provider';
import { AptosProvider } from './aptos.provider';

export class ProviderFactory {
  static createProvider(blockchain: string, network: string): BlockchainProvider {
    switch (blockchain.toLowerCase()) {
      case 'xrpl':
        return new XRPLProvider(network);
      case 'aptos':
        return new AptosProvider(network);
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }
}