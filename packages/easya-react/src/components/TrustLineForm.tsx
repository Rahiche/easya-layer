import React, { useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { TransactionStatus } from './TransactionStatus';

const TrustLineForm: React.FC = () => {
    const {
        values,
        updateValue,
        connectionStatus,
        transactionStatus,
        sdk
    } = useBlockchain();

    const [error, setError] = useState<string>('');
    const isConnected = connectionStatus?.toLowerCase().includes('connected');

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const limit = e.target.value;
        updateValue('trustLineLimit', limit);

        if (parseFloat(limit) < 0) {
            setError('Trust line limit cannot be negative');
        } else {
            setError('');
        }
    };

    const createTrustLine = async () => {
        if (!sdk) return;

        try {
            const config = {
                currency: values.currency,
                issuer: values.issuerAddress,
                limit: values.trustLineLimit
            };

            await sdk.createTrustLine(config);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create trust line');
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

    return (
        <div className="trustline-container">
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Currency Code (e.g., USD)"
                    value={values.currency}
                    onChange={(e) => updateValue('currency', e.target.value.toUpperCase())}
                    className="trustline-input"
                    disabled={!isConnected}
                />
                <input
                    type="text"
                    placeholder="Issuer Address"
                    value={values.issuerAddress}
                    onChange={(e) => updateValue('issuerAddress', e.target.value)}
                    className="trustline-input"
                    disabled={!isConnected}
                />
                <input
                    type="number"
                    placeholder="Trust Line Limit"
                    value={values.trustLineLimit}
                    onChange={handleLimitChange}
                    className="trustline-input"
                    disabled={!isConnected}
                    min="0"
                    step="any"
                />
            </div>

            {error && (
                <div className="trustline-error">
                    {error}
                </div>
            )}

            <button
                onClick={createTrustLine}
                className="trustline-button"
                disabled={!isConnected || !!error || !values.currency || 
                         !values.issuerAddress || !values.trustLineLimit}
            >
                Create Trust Line
            </button>
        </div>
    );
};

export default TrustLineForm;