import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface BalanceDisplayProps {
  className?: string;
  refreshInterval?: number | null; // in milliseconds, null means no refresh
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  className = '',
  refreshInterval = null // Default to no refresh
}) => {
  const { connectionStatus, getBalance, getCurrencySymbol } = useBlockchain();
  const [balance, setBalance] = useState<string>('0');
  const [symbol, setSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (connectionStatus !== 'Connected') return;
    
    try {
      setIsLoading(true);
      setError(null);
      const [newBalance, currencySymbol] = await Promise.all([
        getBalance(),
        getCurrencySymbol()
      ]);
      setBalance(newBalance);
      setSymbol(currencySymbol);
    } catch (err) {
      setError('Failed to fetch balance');
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    if (refreshInterval !== null) {
      const intervalId = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, refreshInterval]);


  const renderBalance = () => {
    if (!connectionStatus || connectionStatus === 'Disconnected') {
      return 'Not connected';
    }
    
    if (connectionStatus === 'Connecting...') {
      return 'Connecting...';
    }
    
    if (isLoading) {
      return 'Loading...';
    }
    
    if (error) {
      return error;
    }
    
    return `${balance} ${symbol}`;
  };

  const getBalanceClassNames = () => {
    const baseClass = 'easya-balance-display__value';
    if (!connectionStatus || connectionStatus === 'Disconnected') {
      return `${baseClass} easya-balance-display__value--disconnected`;
    }
    if (isLoading) {
      return `${baseClass} easya-balance-display__value--loading`;
    }
    return baseClass;
  };

  return (
    <div className={`easya-balance-display ${className}`}>
      <div className="easya-balance-display__content">
        <h3 className="easya-balance-display__title">
          Current Balance
        </h3>
        <div className="easya-balance-display__info">
          <span className={getBalanceClassNames()}>
            {renderBalance()}
          </span>
          <button
            onClick={fetchBalance}
            disabled={!connectionStatus || connectionStatus !== 'Connected' || isLoading}
            className="easya-balance-display__refresh"
            aria-label="Refresh balance"
          >
            Refresh
          </button>
        </div>
        {error && (
          <p className="easya-balance-display__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default BalanceDisplay;