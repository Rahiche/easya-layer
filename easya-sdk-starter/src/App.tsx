import React from 'react';
import * as EasyaSDK from '../../packages/easya-react/src';
import { EasyaConfig } from '../../src/core/types';

const blockchainConfig: EasyaConfig = {
    network: 'testnet',
    blockchain: 'xrpl',
};

const App: React.FC = () => {
    return (
        <EasyaSDK.BlockchainProvider config={blockchainConfig}>
            <div className="app-container">
                <div className="content-wrapper">
                    <div className="card">
                        <div className="card-content">
                                <div className="content-section">
                                    <h1 className="title">EasyaSDK Starter</h1>
                                    <div className="components-container">
                                        <EasyaSDK.ConnectButton />
                                        {/* // TODO: show balance using BalanceDisplay component */}
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </EasyaSDK.BlockchainProvider>
    );
};

export default App;