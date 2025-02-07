import React from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface TransactionStatusProps {
    status: string;
    isLoading?: boolean;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
    status,
    isLoading = false
}) => {
    const { sdk } = useBlockchain();

    if (!status && !isLoading) {
        return null;
    }

    // Determine blockchain and network from SDK
    const chain: 'xrpl' | 'aptos' = sdk?.getBlockchain()?.toLowerCase() as 'xrpl' | 'aptos' || 'xrpl';
    const isTestnet = sdk?.config?.network === 'testnet';

    // XRPL-specific regex patterns
    const xrplHashMatch = status?.match(/Hash: ([a-fA-F0-9]+)/);
    const xrplNftMatch = status?.match(/NFT minted successfully! (.*)/);

    // Aptos-specific regex patterns
    const aptosHashMatch = status?.match(/Version: (\d+)/);
    const aptosNftMatch = status?.match(/Token minted: (0x[a-fA-F0-9]+)/);

    // Determine which hash to use based on the chain
    const hash = chain === 'xrpl' ?
        (xrplHashMatch ? xrplHashMatch[1] : null) :
        (aptosHashMatch ? aptosHashMatch[1] : null);

    // Determine which NFT ID to use based on the chain
    const nftId = chain === 'xrpl' ?
        (xrplNftMatch ? xrplNftMatch[1] : null) :
        (aptosNftMatch ? aptosNftMatch[1] : null);

    // Define explorer base URLs with network awareness
    const explorerUrls = {
        xrpl: {
            testnet: {
                transaction: 'https://test.xrplexplorer.com/explorer/',
                nft: 'https://test.xrplexplorer.com/en/nft/'
            },
            mainnet: {
                transaction: 'https://xrplexplorer.com/explorer/',
                nft: 'https://xrplexplorer.com/en/nft/'
            }
        },
        aptos: {
            testnet: {
                transaction: 'https://explorer.aptoslabs.com/txn/',
                nft: 'https://explorer.aptoslabs.com/token/'
            },
            mainnet: {
                transaction: 'https://explorer.aptoslabs.com/txn/',
                nft: 'https://explorer.aptoslabs.com/token/'
            }
        }
    };

    // Get correct network type
    const network = isTestnet ? 'testnet' : 'mainnet';

    // Construct appropriate explorer URLs based on chain and network
    const explorerUrl = hash ?
        `${explorerUrls[chain][network].transaction}${hash}` :
        null;

    const nftExplorerUrl = nftId ?
        `${explorerUrls[chain][network].nft}${nftId}` :
        null;

    return (
        <div className="transaction-status-container">
            <div className="content-wrapper">
                {isLoading ? (
                    <div className="status-message loading">
                        <div className="loading-spinner" />
                        <span>Processing {chain.toUpperCase()} transaction on {network}...</span>
                    </div>
                ) : (
                    <div className="status-links">
                        {explorerUrl && (
                            <div className="explorer-link-container">
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="explorer-link"
                                >
                                    <span>View on {chain.toUpperCase()} Explorer ({network})</span>
                                    <svg
                                        className="explorer-icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            </div>
                        )}
                        {nftExplorerUrl && (
                            <div className="explorer-link-container">
                                <a
                                    href={nftExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="explorer-link"
                                >
                                    <span>View NFT on {chain.toUpperCase()} Explorer ({network})</span>
                                    <svg
                                        className="explorer-icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            </div>
                        )}
                        {!explorerUrl && !nftExplorerUrl && (
                            status ? (
                                <div className="status-message raw-status">
                                    <span>Raw Status: {status}</span>
                                </div>
                            ) : (
                                <div className="status-message">
                                    <span>No transaction data available</span>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionStatus;