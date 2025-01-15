import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { TransactionStatus } from './TransactionStatus';

const TransactionForm: React.FC = () => {
    const { 
        values, 
        updateValue, 
        sendTransaction,
        connectionStatus,
        transactionStatus,
        getBalance,
        getCurrencySymbol
    } = useBlockchain();

    const [balance, setBalance] = useState<string>('0');
    const [currencySymbol, setCurrencySymbol] = useState<string>('');
    const [error, setError] = useState<string>('');
    
    const isConnected = connectionStatus?.toLowerCase().includes('connected');

    useEffect(() => {
        const initializeData = async () => {
            if (isConnected) {
                try {
                    const [currentBalance, symbol] = await Promise.all([
                        getBalance(),
                        getCurrencySymbol()
                    ]);
                    setBalance(currentBalance);
                    setCurrencySymbol(symbol);
                } catch (err) {
                    console.error('Error initializing data:', err);
                }
            }
        };
        
        initializeData();
    }, [isConnected, getBalance, getCurrencySymbol]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value;
        updateValue('transactionAmount', amount);
        
        if (parseFloat(amount) > parseFloat(balance)) {
            setError(`Insufficient balance. You have ${balance} ${currencySymbol} available.`);
        } else {
            setError('');
        }
    };

    return (
        <div className="transaction-form-container">
            <div className="balance-display">
                {balance ? `Balance: ${balance} ${currencySymbol}` : 'Loading balance...'}
            </div>
            <input
                type="text"
                placeholder="Recipient Address"
                value={values.recipientAddress}
                onChange={(e) => updateValue('recipientAddress', e.target.value)}
                className="transaction-input"
                disabled={!isConnected}
            />
            <div className="amount-input-container">
                <input
                    type="number"
                    placeholder={currencySymbol ? `Amount in ${currencySymbol}` : 'Amount'}
                    value={values.transactionAmount}
                    onChange={handleAmountChange}
                    className="transaction-input"
                    disabled={!isConnected}
                    min="0"
                    step="any"
                />
                {currencySymbol && <span className="currency-symbol">{currencySymbol}</span>}
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
                onClick={sendTransaction}
                className="transaction-button"
                disabled={!isConnected || !!error || !values.recipientAddress || !values.transactionAmount}
            >
                {values.transactionAmount ? `Send ${values.transactionAmount} ${currencySymbol}` : 'Send Transaction'}
            </button>
            {transactionStatus && <TransactionStatus status={transactionStatus} />}
        </div>
    );
};

export default TransactionForm;