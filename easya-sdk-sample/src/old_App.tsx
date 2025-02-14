import React, { useState, useCallback } from 'react';
import { EasyaConfig } from '@easya/layer-js/dist/core/types';
// import { ConfigSelector, EventDisplay, AddressDisplay, BalanceDisplay, BalancesDisplay, BlockchainProvider, ConnectButton, IssueTokenForm, TransactionForm, TrustLineForm } from '@easya/layer-ui-react';

const ComponentsContainer: React.FC<{ blockchainConfig: EasyaConfig }> = ({ blockchainConfig }) => {
    // Create a unique key based on the config
    const getConfigKey = useCallback((config: EasyaConfig) => {
        return `${config.network}-${config.blockchain}-${config.wallet}`;
    }, []);

    return (
        <BlockchainProvider
            config={blockchainConfig}
            key={getConfigKey(blockchainConfig)}
        >
            <div className="components-container">
                <ConnectButton />
                <EventDisplay />
                <BalanceDisplay />
                <AddressDisplay />
                <TransactionForm />
                <TrustLineForm />
                <BalancesDisplay />
                <IssueTokenForm />
                {/* <EasyaSDK.NFTMintingForm /> */}
                {/* <EasyaSDK.NFTGallery /> */}

            </div>
        </BlockchainProvider>
    );
};

const App: React.FC = () => {
    const [blockchainConfig, setBlockchainConfig] = useState<EasyaConfig>({
        network: 'testnet',
        blockchain: 'xrpl',
        wallet: 'crossmark',
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
                            <ConfigSelector
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