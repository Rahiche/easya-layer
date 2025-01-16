import React, { useState } from 'react';
import { BlockchainNetwork, EasyaConfig, BlockchainPlatform, SupportedWallet } from '../../../../src/core/types';

interface ConfigSelectorProps {
    currentConfig: EasyaConfig;
    onConfigChange: (newConfig: EasyaConfig) => void;
}

const ConfigSelector: React.FC<ConfigSelectorProps> = ({ currentConfig, onConfigChange }) => {
    const [config, setConfig] = useState<EasyaConfig>(currentConfig);

    const networks: BlockchainNetwork[] = ['mainnet', 'testnet'];
    const blockchains: BlockchainPlatform[] = ['xrpl', 'aptos'];
    const wallets: SupportedWallet[] = ['crossmark', 'gem'];

    const handleChange = (field: keyof EasyaConfig, value: string) => {
        const newConfig = {
            ...config,
            [field]: value
        };
        setConfig(newConfig);
    };

    const handleSubmit = () => {
        onConfigChange(config);
    };

    return (
        <div className="config-selector">
            <h2 className="config-selector__title">Blockchain Configuration</h2>
            <div className="config-selector__form">
                <div className="config-selector__field">
                    <label className="config-selector__label">
                        Network
                    </label>
                    <select
                        value={config.network}
                        onChange={(e) => handleChange('network', e.target.value as BlockchainNetwork)}
                        className="config-selector__select"
                    >
                        {networks.map((network) => (
                            <option key={network} value={network}>
                                {network}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="config-selector__field">
                    <label className="config-selector__label">
                        Blockchain
                    </label>
                    <select
                        value={config.blockchain}
                        onChange={(e) => handleChange('blockchain', e.target.value as BlockchainPlatform)}
                        className="config-selector__select"
                    >
                        {blockchains.map((blockchain) => (
                            <option key={blockchain} value={blockchain}>
                                {blockchain}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="config-selector__field">
                    <label className="config-selector__label">
                        Wallet
                    </label>
                    <select
                        value={config.wallet}
                        onChange={(e) => handleChange('wallet', e.target.value as SupportedWallet)}
                        className="config-selector__select"
                    >
                        {wallets.map((wallet) => (
                            <option key={wallet} value={wallet}>
                                {wallet}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    className="config-selector__button"
                >
                    Update Configuration
                </button>
            </div>
        </div>
    );
};

export default ConfigSelector;