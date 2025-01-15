import React from 'react';

interface TransactionStatusProps {
    status: string;
    isLoading?: boolean;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ 
    status,
    isLoading = false
}) => {
    console.log(`-----`);
    console.log(`status ${status}`);
    console.log(`-----`);

    // If there's no status and it's not loading, don't render anything
    if (!status && !isLoading) {
        return null;
    }

    const hashMatch = status?.match(/Hash: ([a-fA-F0-9]+)/);
    const hash = hashMatch ? hashMatch[1] : null;
    
    // Extract NFT ID from successful transfer message
    const nftMatch = status?.match(/NFT minted successfully! (.*)/);
    const nftId = nftMatch ? nftMatch[1] : null;
    
    const explorerUrl = hash 
        ? `https://test.xrplexplorer.com/explorer/${hash}`
        : null;
        
    const nftExplorerUrl = nftId 
        ? `https://test.xrplexplorer.com/en/nft/${nftId}`
        : null;

    return (
        <div className="transaction-status-container">
            <div className="content-wrapper">
                {isLoading ? (
                    <div className="status-message loading">
                        <div className="loading-spinner" />
                        <span>Processing transaction...</span>
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
                                    <span>View on XRPL Explorer</span>
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
                                    <span>View NFT on Explorer</span>
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
                            <div className="status-message">
                                <span>No transaction data available</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionStatus;