import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { TransactionStatus } from './TransactionStatus';
import { DEFAULT_SUPPORTED_CURRENCIES, SupportedCurrency } from '../utils/supported_currencies';

const TransactionForm: React.FC = () => {
    const {
        values,
        updateValue,
        sendTransaction,
        connectionStatus,
        transactionStatus,
        getBalance,
        getCurrencySymbol,
        sdk,
    } = useBlockchain();

    const [selectedCurrencyData, setSelectedCurrencyData] = useState<SupportedCurrency | null>(null);
    const [balances, setBalances] = useState<Record<string, string>>({});
    const [error, setError] = useState<string>('');
    const [supportedCurrencies, setSupportedCurrencies] = useState<SupportedCurrency[]>(DEFAULT_SUPPORTED_CURRENCIES);
    const [transactionError, setTransactionError] = useState<string>('');

    const isConnected = connectionStatus?.toLowerCase().includes('connected');

    useEffect(() => {
        const fetchBalanceForCurrency = async (currencySymbol: string) => {
            if (isConnected && currencySymbol) {
                try {
                    const balance = await getBalance();
                    setBalances(prev => ({
                        ...prev,
                        [currencySymbol]: balance
                    }));
                } catch (err) {
                    console.error(`Error fetching balance for ${currencySymbol}:`, err);
                    setError(`Failed to fetch balance for ${currencySymbol}`);
                }
            }
        };

        if (selectedCurrencyData?.symbol) {
            fetchBalanceForCurrency(selectedCurrencyData.symbol);
        }
    }, [isConnected, getBalance, selectedCurrencyData]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value;
        updateValue('transactionAmount', amount);
        setTransactionError(''); // Clear transaction error when amount changes

        if (selectedCurrencyData?.symbol) {
            const currentBalance = balances[selectedCurrencyData.symbol] || '0';
            if (parseFloat(amount) > parseFloat(currentBalance)) {
                setError(`Insufficient balance. You have ${currentBalance} ${selectedCurrencyData.symbol} available.`);
            } else {
                setError('');
            }
        }
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const symbol = e.target.value;
        const currency = supportedCurrencies.find(c => c.symbol === symbol);
        
        if (currency) {
            setSelectedCurrencyData(currency);
            updateValue('selectedCurrency', symbol);
            updateValue('transactionAmount', '');
            setError('');
            setTransactionError(''); // Clear transaction error when currency changes
        }
    };

    const handleSendTransaction = async () => {
        try {
            setTransactionError(''); // Clear any previous transaction errors
            await sendTransaction();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setTransactionError(errorMessage);
        }
    };

    if (!sdk) {
        return (
            <div className="p-4 text-center">
                <h2 className="text-xl font-semibold mb-4">Not Supported</h2>
                <p className="text-gray-600">
                    Currently, this feature is not supported.
                </p>
            </div>
        );
    }

    const currentBalance = selectedCurrencyData?.symbol ? balances[selectedCurrencyData.symbol] : '0';

    // Combine error messages with transaction status
    const displayStatus = error || transactionError || transactionStatus || '';

    return (
        <div className="transaction-form-container space-y-4">
            <div className="balance-display p-2 bg-gray-50 rounded-lg">
                {selectedCurrencyData ? 
                    `Balance: ${currentBalance} ${selectedCurrencyData.symbol}` : 
                    'Select a currency to view balance'
                }
            </div>
            
            <input
                type="text"
                placeholder="Recipient Address"
                value={values.recipientAddress}
                onChange={(e) => updateValue('recipientAddress', e.target.value)}
                className="transaction-input w-full p-2 border rounded"
                disabled={!isConnected}
            />
            
            <div className="amount-input-container flex space-x-2">
                <select
                    value={selectedCurrencyData?.symbol || ''}
                    onChange={handleCurrencyChange}
                    className="currency-select flex-1 p-2 border rounded"
                    disabled={!isConnected}
                >
                    <option value="">Select Currency</option>
                    {supportedCurrencies.map((currency) => (
                        <option key={currency.symbol} value={currency.symbol}>
                            {currency.name} ({currency.symbol})
                        </option>
                    ))}
                </select>
                
                <div className="relative flex-1">
                    <input
                        type="number"
                        placeholder={selectedCurrencyData ? 
                            `Amount in ${selectedCurrencyData.symbol}` : 
                            'Select currency first'
                        }
                        value={values.transactionAmount}
                        onChange={handleAmountChange}
                        className="transaction-input w-full p-2 border rounded"
                        disabled={!isConnected || !selectedCurrencyData}
                        min="0"
                        step="any"
                    />
                    {selectedCurrencyData && 
                        <span className="currency-symbol absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {selectedCurrencyData.symbol}
                        </span>
                    }
                </div>
            </div>

            <button
                onClick={handleSendTransaction}
                className="transaction-button w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={
                    !isConnected || 
                    !!error || 
                    !values.recipientAddress || 
                    !values.transactionAmount || 
                    !selectedCurrencyData
                }
            >
                {values.transactionAmount && selectedCurrencyData ? 
                    `Send ${values.transactionAmount} ${selectedCurrencyData.symbol}` : 
                    'Send Transaction'
                }
            </button>

            {displayStatus && (
                <div className={`text-center p-2 rounded ${error || transactionError ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                    {displayStatus}
                </div>
            )}
        </div>
    );
};

export default TransactionForm;