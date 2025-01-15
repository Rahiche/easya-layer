import React from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface MintNFTButtonProps {
  className?: string;
}

const MintNFTButton: React.FC<MintNFTButtonProps> = ({ className = '' }) => {
  const {
    connectionStatus,
    transactionStatus,
    values,
    updateValue,
    mintNFT
  } = useBlockchain();

  const isConnected = connectionStatus === 'Connected';
  const isMinting = transactionStatus === 'Minting NFT...';

  const getButtonColor = (): string => {
    if (!isConnected) return 'button-disconnected';
    if (isMinting) return 'button-minting';
    return 'button-ready';
  };

  const getButtonText = (): string => {
    if (!isConnected) return 'Connect to Blockchain First';
    if (isMinting) return 'Minting...';
    return 'Mint NFT';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mintNFT();
  };

  const isFormValid = values.nftName.trim() !== '' && 
                     values.nftDescription.trim() !== '' && 
                     isConnected;

  return (
    <form onSubmit={handleSubmit} className="nft-form">
      <div className="input-container">
        <input
          type="text"
          placeholder="NFT Name"
          value={values.nftName}
          onChange={(e) => updateValue('nftName', e.target.value)}
          disabled={!isConnected || isMinting}
          className="nft-input"
        />
        <textarea
          placeholder="NFT Description"
          value={values.nftDescription}
          onChange={(e) => updateValue('nftDescription', e.target.value)}
          disabled={!isConnected || isMinting}
          className="nft-textarea"
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isMinting}
        className={`mint-button ${getButtonColor()} ${className}`}
      >
        {getButtonText()}
      </button>

      {transactionStatus && (
        <p className="status-text">
          {transactionStatus}
        </p>
      )}
    </form>
  );
};

export default MintNFTButton;