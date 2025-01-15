import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { NFT } from '../../../../src/core/types';

interface NFTGalleryProps {
  className?: string;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ className = '' }) => {
  const { connectionStatus, sdk, getNFTs } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (connectionStatus !== 'Connected') return;

      setLoading(true);
      setError(null);
      try {
        const fetchedNFTs = await getNFTs();
        setNfts(fetchedNFTs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
        console.error('Error fetching NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [connectionStatus, getNFTs]);

  const filterNFTs = (nfts: NFT[]) => {
    return nfts.filter(nft => {
      if (searchTerm) {
        return nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  };

  const handleBuyNFT = async (nftId: string) => {
    try {
      console.log(`Initiating purchase for NFT ${nftId}`);
      // Implement purchase logic here using sdk
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  const ImagePlaceholder = () => (
    <svg
      className="placeholder-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M20.4 14.5L16 10 4 20" />
    </svg>
  );

  const NFTCard = ({ nft }: { nft: NFT }) => (
    <div className="nft-card">
      <div className="nft-image-container">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="nft-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('fallback-active');
            }}
          />
        ) : (
          <div className="nft-placeholder">
            <ImagePlaceholder />
          </div>
        )}
      </div>

      <div className="nft-info">
        <h3 className="nft-name">{nft.name}</h3>
        <p className="nft-description">{nft.description}</p>
        <div className="nft-details">
          <span className="nft-token-id">
            Token ID: {nft.id}
          </span>
          <span className="nft-owner">
            {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
          </span>
          <span className="nft-price">
            {nft.price || 'Not for sale'}
          </span>
        </div>
        {connectionStatus === 'Connected' &&
          nft.price &&
          nft.price !== 'Not for sale' && (
            <button
              onClick={() => handleBuyNFT(nft.id)}
              className="buy-button"
            >
              Purchase
            </button>
          )}
      </div>
    </div>
  );

  const EmptyStateIcon = () => (
    <svg
      className="empty-state-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0013.56 2H6a2 2 0 00-2 2z" />
      <path d="M14 2v4a2 2 0 002 2h4" />
      <path d="M10 9v8" />
      <path d="M14 13H6" />
    </svg>
  );

  return (
    <div className={`nft-gallery ${className}`}>
      <div className="gallery-header">
        <h2 className="gallery-title">Gallery</h2>
        {connectionStatus !== 'Connected' && (
          <p className="connection-warning">Connect wallet to view NFTs</p>
        )}
      </div>

      <div className="gallery-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search collection"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="nft-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="nft-card loading">
              <div className="nft-image-container skeleton"></div>
              <div className="nft-info">
                <div className="nft-name skeleton"></div>
                <div className="nft-description skeleton"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="error-message">
            <div className="connection-warning">{error}</div>
          </div>
        ) : filterNFTs(nfts).length === 0 ? (
          <div className="empty-state">
            <EmptyStateIcon />
            <div className="empty-message">
              {searchTerm ? 'No items match your search' : 'No items available'}
            </div>
          </div>
        ) : (
          filterNFTs(nfts).map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))
        )}
      </div>
    </div>
  );
};

export default NFTGallery;