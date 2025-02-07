import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { TransactionStatus } from './TransactionStatus';
import { DEFAULT_SUPPORTED_CURRENCIES, SupportedCurrency } from '../utils/supported_currencies';
import { Balance } from '../../../../src/core/types';

const TransactionForm: React.FC = () => {
    const {
        values,
        updateValue,
        sendTransaction,
        connectionStatus,
        transactionStatus,
        getBalance,
        getBalances,
        getCurrencySymbol,
        sdk,
    } = useBlockchain();

    const [selectedAsset, setSelectedAsset] = useState<Balance | SupportedCurrency | null>(null);
    const [availableAssets, setAvailableAssets] = useState<(Balance | SupportedCurrency)[]>([]);
    const [error, setError] = useState<string>('');
    const [transactionError, setTransactionError] = useState<string>('');

    const isConnected = connectionStatus?.toLowerCase().includes('connected');

    useEffect(() => {
        const fetchAssets = async () => {
            if (!isConnected) return;
            
            try {
                const tokenBalances = await getBalances();
                const allAssets = [...DEFAULT_SUPPORTED_CURRENCIES, ...tokenBalances];
                setAvailableAssets(allAssets);
            } catch (err) {
                console.error('Error fetching balances:', err);
                setError('Failed to fetch available assets');
            }
        };

        fetchAssets();
    }, [isConnected, getBalances]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value;
        updateValue('transactionAmount', amount);
        setTransactionError('');

        if (selectedAsset) {
            const balance = 'value' in selectedAsset ? selectedAsset.value : '0';
            if (parseFloat(amount) > parseFloat(balance)) {
                setError(`Insufficient balance. You have ${balance} available.`);
            } else {
                setError('');
            }
        }
    };

    const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const asset = availableAssets.find(a => 
            'symbol' in a ? a.symbol === selectedId : a.currency === selectedId
        );
        
        if (asset) {
            setSelectedAsset(asset);
            updateValue('selectedCurrency', 'symbol' in asset ? asset.symbol : asset.currency);
            updateValue('transactionAmount', '');
            setError('');
            setTransactionError('');
        }
    };

    const handleSendTransaction = async () => {
        try {
            setTransactionError('');
            await sendTransaction();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setTransactionError(errorMessage);
        }
    };

    if (!sdk) {
        return <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Not Supported</h2>
            <p className="text-gray-600">Currently, this feature is not supported.</p>
        </div>;
    }

    const getAssetDisplay = (asset: Balance | SupportedCurrency) => {
        if ('symbol' in asset) {
            return `${asset.name} (${asset.symbol})`;
        }
        return `${asset.nonStandard || asset.currency}${asset.issuer ? ` (${asset.issuer})` : ''}`;
    };

    const getAssetId = (asset: Balance | SupportedCurrency) => 
        'symbol' in asset ? asset.symbol : asset.currency;

    const displayStatus = error || transactionError || transactionStatus || '';

    return (
        <div className="transaction-form-container space-y-4">
            <div className="balance-display p-2 bg-gray-50 rounded-lg">
                {selectedAsset ? 
                    `Balance: ${('value' in selectedAsset ? selectedAsset.value : '0')} ${getAssetDisplay(selectedAsset)}` : 
                    'Select an asset to view balance'
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
                    value={selectedAsset ? getAssetId(selectedAsset) : ''}
                    onChange={handleAssetChange}
                    className="asset-select flex-1 p-2 border rounded"
                    disabled={!isConnected}
                >
                    <option value="">Select Asset</option>
                    {availableAssets.map((asset) => (
                        <option key={getAssetId(asset)} value={getAssetId(asset)}>
                            {getAssetDisplay(asset)}
                        </option>
                    ))}
                </select>
                
                <div className="relative flex-1">
                    <input
                        type="number"
                        placeholder={selectedAsset ? `Amount` : 'Select asset first'}
                        value={values.transactionAmount}
                        onChange={handleAmountChange}
                        className="transaction-input w-full p-2 border rounded"
                        disabled={!isConnected || !selectedAsset}
                        min="0"
                        step="any"
                    />
                </div>
            </div>

            <button
                onClick={handleSendTransaction}
                className="transaction-button w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isConnected || !!error || !values.recipientAddress || !values.transactionAmount || !selectedAsset}
            >
                {values.transactionAmount && selectedAsset ? 
                    `Send ${values.transactionAmount} ${getAssetId(selectedAsset)}` : 
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