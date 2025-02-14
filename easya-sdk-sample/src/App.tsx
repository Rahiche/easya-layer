import React, { useState, useCallback } from 'react';
import { darkMode, lightMode } from './theme';
import { EasyaConfig } from '@easya/layer-js/dist/core/types';
import { AddressDisplay, BalanceDisplay, BalancesDisplay, BlockchainProvider, ConnectButton, IssueTokenForm, TransactionForm, TrustLineForm } from '@easya/layer-ui-react';

const App: React.FC = () => {
    const [blockchainConfig] = useState<EasyaConfig>({
        network: 'testnet',
        blockchain: 'xrpl',
        wallet: 'crossmark',
    });

    const [activeTab, setActiveTab] = useState('sendToken');
    const [isDarkMode, setIsDarkMode] = useState(true); // State for dark mode

    const handleTabClick = useCallback((tabName: string) => {
        setActiveTab(tabName);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(!isDarkMode);
    }, [isDarkMode]);

    const currentMode = isDarkMode ? darkMode : lightMode;

    const getConfigKey = useCallback((config: EasyaConfig) => {
        return `${config.network}-${config.blockchain}-${config.wallet}`;
    }, []);

    return (
        <BlockchainProvider
            config={blockchainConfig}
            key={getConfigKey(blockchainConfig)}
        >
            <div className="app-container" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: currentMode.background,
                color: currentMode.text,
                fontFamily: 'Arial, sans-serif',
            }}>
                {/* App Bar */}
                <div className="app-bar" style={{
                    backgroundColor: currentMode.appBar,
                    padding: '20px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                }}>
                    <div className="app-title" style={{ fontSize: '24px', fontWeight: "bold", color: currentMode.text }}>
                        Token Sender Demo
                    </div>
                    <div className="app-bar-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginRight: '25px', fontSize: '16px' }}>
                            <BalanceDisplay />
                        </div>
                        <div style={{ marginRight: '30px', fontSize: '16px' }}>
                            <AddressDisplay
                                className="custom-address-display"
                            />
                        </div>
                        <div className="connect-button-container" style={{ marginRight: '20px' }}>
                            <ConnectButton
                                className="custom-connect-button"
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation" style={{
                    display: 'flex',
                    backgroundColor: currentMode.tabInactive,
                    paddingLeft: '30px',
                    borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                }}>
                    <button
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: activeTab === 'sendToken' ? currentMode.tabActive : 'transparent',
                            cursor: 'pointer',
                            color: activeTab === 'sendToken' ? currentMode.tabTextActive : currentMode.tabTextInactive,
                            fontWeight: activeTab === 'sendToken' ? '500' : 'normal',
                            fontSize: '16px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={() => handleTabClick('sendToken')}
                    >
                        Send Token
                    </button>
                    <button
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: activeTab === 'issueToken' ? currentMode.tabActive : 'transparent',
                            cursor: 'pointer',
                            color: activeTab === 'issueToken' ? currentMode.tabTextActive : currentMode.tabTextInactive,
                            fontWeight: activeTab === 'issueToken' ? '500' : 'normal',
                            fontSize: '16px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={() => handleTabClick('issueToken')}
                    >
                        Issue Token
                    </button>
                    <button
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: activeTab === 'trustLines' ? currentMode.tabActive : 'transparent',
                            cursor: 'pointer',
                            color: activeTab === 'trustLines' ? currentMode.tabTextActive : currentMode.tabTextInactive,
                            fontWeight: activeTab === 'trustLines' ? '500' : 'normal',
                            fontSize: '16px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={() => handleTabClick('trustLines')}
                    >
                        Trust Lines
                    </button>
                    {/* ADD BALANCE TAB HERE */}
                    <button
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: activeTab === 'tokenBalances' ? currentMode.tabActive : 'transparent',
                            cursor: 'pointer',
                            color: activeTab === 'tokenBalances' ? currentMode.tabTextActive : currentMode.tabTextInactive,
                            fontWeight: activeTab === 'tokenBalances' ? '500' : 'normal',
                            fontSize: '16px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={() => handleTabClick('tokenBalances')}
                    >
                        Token Balances
                    </button>
                </div>

                {/* Content Area */}
                <div className="content-wrapper" style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
                    <div className="card" style={{
                        backgroundColor: currentMode.cardBackground,
                        borderRadius: '12px',
                        boxShadow: isDarkMode ? '0 2px 5px rgba(0,0,0,0.7)' : '0 2px 5px rgba(0,0,0,0.1)',
                        marginBottom: '30px',
                    }}>
                        <div className="card-content" style={{ padding: '30px', backgroundColor: currentMode.cardContentBackground }}>
                            <div className="content-section">
                                {/* Tab Content */}
                                {activeTab === 'sendToken' && (
                                    <>
                                        {/* Balance and Address are now in AppBar */}
                                        <TransactionForm
                                        />
                                    </>
                                )}
                                {activeTab === 'issueToken' && (
                                    <IssueTokenForm

                                    />
                                )}
                                {activeTab === 'trustLines' && (
                                    <TrustLineForm
                                    />
                                )}
                                {/* ADD BALANCE DISPLAY HERE */}
                                {activeTab === 'tokenBalances' && (
                                    <>
                                        <BalancesDisplay />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockchainProvider>
    );
};

export default App;