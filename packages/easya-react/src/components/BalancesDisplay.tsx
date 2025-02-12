import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { Balance } from '../../../easya-core/src/core/types';


interface BalancesDisplayProps {
    className?: string;
    refreshInterval?: number | null; // in milliseconds, null means no refresh
}

export const BalancesDisplay: React.FC<BalancesDisplayProps> = ({
    className = '',
    refreshInterval = null // Default to no refresh
}) => {
    const { connectionStatus, getBalances } = useBlockchain();
    const [balances, setBalances] = useState<Balance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalances = async () => {
        if (connectionStatus !== 'Connected') return;

        try {
            setIsLoading(true);
            setError(null);
            const balancesData = await getBalances();

            // Handle different balance response formats
            const formattedBalances = Array.isArray(balancesData) ? balancesData : [];

            setBalances(formattedBalances);
        } catch (err) {
            setError('Failed to fetch balances');
            console.error('Error fetching balances:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
        if (refreshInterval !== null) {

            const intervalId = setInterval(fetchBalances, refreshInterval);
            return () => clearInterval(intervalId);
        }
    }, [connectionStatus, refreshInterval]);

    const renderBalances = () => {
        if (!connectionStatus || connectionStatus === 'Disconnected') {
            return <div className="easya-balances-display__status">Not connected</div>;
        }

        if (connectionStatus === 'Connecting...') {
            return <div className="easya-balances-display__status">Connecting...</div>;
        }

        if (isLoading) {
            return <div className="easya-balances-display__status">Loading...</div>;
        }

        if (error) {
            return <div className="easya-balances-display__error" role="alert">{error}</div>;
        }

        return (
            <div className="easya-balances-display__list">
                {balances.map((balance, index) => (
                    <div
                        key={`${balance.currency}-${balance.issuer || index}`}
                        className="easya-balances-display__item"
                    >
                        <div className="easya-balances-display__currency">
                            {balance.nonStandard != "" ? balance.nonStandard : balance.currency}
                            {balance.issuer && (
                                <span className="easya-balances-display__issuer">
                                    Issuer: {balance.issuer}
                                </span>
                            )
                            }
                            {balance.nonStandard != "" && (
                                <span className="easya-balances-display__issuer">
                                    Hex: {balance.currency}
                                </span>
                            )
                            }
                        </div>
                        <div className="easya-balances-display__value">
                            {balance.value}
                        </div>
                    </div>
                ))}
                {balances.length === 0 && (
                    <div className="easya-balances-display__empty">
                        No balances available
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`easya-balances-display ${className}`}>
            <div className="easya-balances-display__content">
                <div className="easya-balances-display__header">
                    <h3 className="easya-balances-display__title">
                        Available Balances
                    </h3>
                    <button
                        onClick={fetchBalances}
                        disabled={!connectionStatus || connectionStatus !== 'Connected' || isLoading}
                        className="easya-balances-display__refresh"
                        aria-label="Refresh balances"
                    >
                        Refresh
                    </button>
                </div>
                {renderBalances()}
            </div>
        </div>
    );
};

export default BalancesDisplay;