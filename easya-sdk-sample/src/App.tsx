import React, { useState, useCallback } from 'react';
import * as EasyaSDK from '../../packages/easya-react/src';
import { EasyaConfig } from '../../src/core/types';

const ComponentsContainer: React.FC<{ blockchainConfig: EasyaConfig }> = ({ blockchainConfig }) => {
    // Create a unique key based on the config
    const getConfigKey = useCallback((config: EasyaConfig) => {
        return `${config.network}-${config.blockchain}-${config.wallet}`;
    }, []);

    return (
        <EasyaSDK.BlockchainProvider 
            config={blockchainConfig} 
            key={getConfigKey(blockchainConfig)}
        >
            <div className="components-container">
                <EasyaSDK.ConnectButton />
                <EasyaSDK.BalanceDisplay />
                <EasyaSDK.AddressDisplay />
                <EasyaSDK.NFTMintingForm />
                <EasyaSDK.NFTGallery />
                <EasyaSDK.TransactionForm />
            </div>
        </EasyaSDK.BlockchainProvider>
    );
};

const App: React.FC = () => {
    const [blockchainConfig, setBlockchainConfig] = useState<EasyaConfig>({
        network: 'testnet',
        blockchain: 'xrpl',
        wallet: 'gem',
    });

    const handleConfigChange = (newConfig: EasyaConfig) => {
        setBlockchainConfig(newConfig);
    };

    return (
        <div className="app-container">
            <div className="content-wrapper">
                <div className="card">
                    <div className="card-content">
                        <div className="content-section">
                            <h1 className="title">EasyaSDK Demo</h1>
                            <EasyaSDK.ConfigSelector
                                currentConfig={blockchainConfig}
                                onConfigChange={handleConfigChange}
                            />
                            <ComponentsContainer
                                blockchainConfig={blockchainConfig}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;