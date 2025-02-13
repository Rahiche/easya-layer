import React, { useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { TransactionStatus } from './TransactionStatus';
import { ConnectionStatus } from './types';

const NFTTransferForm: React.FC = () => {
    const {
        connectionStatus,
        transactionStatus,
        transferNFT
    } = useBlockchain();

    const [formData, setFormData] = useState({
        tokenId: '',
        recipientAddress: ''
    });
    const [error, setError] = useState('');

    const isConnected = connectionStatus === ConnectionStatus.CONNECTED;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleTransfer = async () => {
        try {
            if (!formData.tokenId.trim() || !formData.recipientAddress.trim()) {
                setError('Please fill in all fields');
                return;
            }

            await transferNFT(formData.tokenId, formData.recipientAddress);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to transfer NFT');
        }
    };

    return (
        <div className="nft-transfer-form">
            <h2 className="form-title">Transfer NFT</h2>

            <div className="form-container">
                <div className="form-field">
                    <label className="form-label">
                        Token ID
                    </label>
                    <input
                        type="text"
                        name="tokenId"
                        placeholder="Enter NFT Token ID"
                        value={formData.tokenId}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isConnected}
                    />
                </div>

                <div className="form-field">
                    <label className="form-label">
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        name="recipientAddress"
                        placeholder="Enter recipient's wallet address"
                        value={formData.recipientAddress}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isConnected}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleTransfer}
                    disabled={!isConnected || !formData.tokenId || !formData.recipientAddress}
                    className="transfer-button"
                >
                    Transfer NFT
                </button>

                {transactionStatus && <TransactionStatus status={transactionStatus} />}
            </div>
        </div>
    );
};

export default NFTTransferForm;