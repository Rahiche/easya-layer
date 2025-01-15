import React from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface ConnectButtonProps {
  className?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ className = '' }) => {
  const {
    connectionStatus,
    connectToBlockchain,
    disconnectFromBlockchain,
    transactionStatus
  } = useBlockchain();

  const isConnecting = connectionStatus === 'Connecting...';
  const isDisconnecting = connectionStatus === 'Disconnecting...';
  const isConnected = connectionStatus == 'Connected';

  const getButtonClass = (): string => {
    if (isConnected) return 'button-disconnected';
    if (isConnecting) return 'button-connecting';
    if (isDisconnecting) return 'button-disconnecting';
    return 'button-connect';
  };

  const getButtonText = (): string => {
    console.log(`connectionStatus ${connectionStatus}`);
    if (isConnected) return 'Disconnect';
    if (isConnecting) return 'Connecting...';
    if (isDisconnecting) return 'Disconnecting...';
    return 'Connect to Blockchain';
  };

  const handleClick = () => {
    console.log(`isConnected ${isConnected}`);
    if (isConnected) {
      disconnectFromBlockchain();
    } else {
      connectToBlockchain();
    }
  };

  return (
    <div className="connect-button-container">
      <button
        onClick={handleClick}
        disabled={isConnecting || isDisconnecting}
        className={`connect-button ${getButtonClass()} ${className}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default ConnectButton;