import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { ConnectionStatus } from './types';

interface ConnectButtonProps {
  className?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ className = '' }) => {
  const {
    connectionStatus,
    connectToBlockchain,
    disconnectFromBlockchain,
    transactionStatus,
    checkWalletInstalled 
  } = useBlockchain();

  const [isWalletInstalled, setIsWalletInstalled] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isConnecting = connectionStatus === ConnectionStatus.CONNECTING;
  const isDisconnecting = connectionStatus === ConnectionStatus.DISCONNECTING;
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const hasWallet = await checkWalletInstalled();
        setIsWalletInstalled(hasWallet);
        if (!hasWallet) {
          setErrorMessage('Please install a wallet to connect to the blockchain');
        }
      } catch (error) {
        setIsWalletInstalled(false);
        setErrorMessage('Error checking wallet status');
      }
    };

    checkWallet();
  }, [checkWalletInstalled]);

  const getButtonClass = (): string => {
    if (!isWalletInstalled) return 'button-error';
    if (isConnected) return 'button-disconnected';
    if (isConnecting) return 'button-connecting';
    if (isDisconnecting) return 'button-disconnecting';
    return 'button-connect';
  };

  const getButtonText = (): string => {
    if (!isWalletInstalled) return 'Wallet Not Found';
    if (isConnected) return 'Disconnect';
    if (isConnecting) return 'Connecting...';
    if (isDisconnecting) return 'Disconnecting...';
    return 'Connect to Blockchain';
  };

  const handleClick = async () => {
    if (!isWalletInstalled) {
      setErrorMessage('Please install a wallet to connect to the blockchain');
      return;
    }

    try {
      if (isConnected) {
        await disconnectFromBlockchain();
      } else {
        await connectToBlockchain();
      }
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to blockchain');
    }
  };

  return (
    <div className="connect-button-container">
      <button
        onClick={handleClick}
        disabled={!isWalletInstalled || isConnecting || isDisconnecting}
        className={`connect-button ${getButtonClass()} ${className}`}
      >
        {getButtonText()}
      </button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ConnectButton;