import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { ConnectionStatus } from './types';

interface AddressDisplayProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ 
  className = '',
  refreshInterval = 10000 // Default refresh every 10 seconds
}) => {
  const { connectionStatus, getAddress } = useBlockchain();
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchAddress = async () => {
    if (connectionStatus !== ConnectionStatus.CONNECTED) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const newAddress = await getAddress();
      setAddress(newAddress);
    } catch (err) {
      setError('Failed to fetch address');
      console.error('Error fetching address:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
    
    const intervalId = setInterval(fetchAddress, refreshInterval);
    return () => clearInterval(intervalId);
  }, [connectionStatus, refreshInterval]);

  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy address:', err);
      setError('Failed to copy address to clipboard');
    }
  };

  const renderAddress = () => {
    if (!connectionStatus || connectionStatus === ConnectionStatus.DISCONNECTED) {
      return 'Not connected';
    }
    
    if (connectionStatus === ConnectionStatus.CONNECTING) {
      return 'Connecting...';
    }
    
    if (isLoading) {
      return 'Loading...';
    }
    
    if (error) {
      return error;
    }
    
    // Format address to show first 6 and last 4 characters
    if (address && address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    return address;
  };

  const getAddressClassNames = () => {
    const baseClass = 'easya-address-display__value';
    if (!connectionStatus || connectionStatus === ConnectionStatus.DISCONNECTED) {
      return `${baseClass} easya-address-display__value--disconnected`;
    }
    if (isLoading) {
      return `${baseClass} easya-address-display__value--loading`;
    }
    return baseClass;
  };

  return (
    <div className={`easya-address-display ${className}`}>
      <div className="easya-address-display__content">
        <h3 className="easya-address-display__title">
          Current Address
        </h3>
        <div className="easya-address-display__info">
          <span className={getAddressClassNames()}>
            {renderAddress()}
          </span>
          <div className="easya-address-display__actions">
            <button
              onClick={handleCopyAddress}
              disabled={!address || connectionStatus !== ConnectionStatus.CONNECTED}
              className="easya-address-display__copy"
              aria-label={copySuccess ? "Address copied" : "Copy address"}
              title={copySuccess ? "Address copied" : "Copy address"}
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={fetchAddress}
              disabled={!connectionStatus || connectionStatus !== ConnectionStatus.CONNECTED || isLoading}
              className="easya-address-display__refresh"
              aria-label="Refresh address"
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <p className="easya-address-display__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressDisplay;