import React, { useState, useCallback } from 'react';
import * as EasyaSDK from '../../packages/easya-react/src';
import { EasyaConfig } from '../../src/core/types';

const App: React.FC = () => {
    const [blockchainConfig] = useState<EasyaConfig>({
        network: 'testnet',
        blockchain: 'xrpl',
        wallet: 'crossmark',
    });

    const [activeTab, setActiveTab] = useState('sendToken');
    const [isDarkMode, setIsDarkMode] = useState(true); // State for dark mode

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Styles for light and dark mode
    const lightMode = {
        background: '#f9f9f9',
        text: '#333',
        appBar: '#fff',
        tabActive: '#e0e0e0',
        tabInactive: '#f0f0f0',
        card: '#fff',
        buttonPrimary: '#3b82f6',
        buttonPrimaryText: '#fff',
        buttonSecondary: '#ef4444',
        buttonSecondaryText: '#fff',
        buttonError: '#f97316',
        buttonErrorText: '#fff',
        tabTextActive: '#222',
        tabTextInactive: '#555',
        cardBackground: '#fff',
        cardContentBackground: '#fff',
        inputBackground: '#fff',
        inputBorder: '#ccc',
        inputTextColor: '#333',
    };

    const darkMode = {
        background: '#121212',
        text: '#eee',
        appBar: '#1e1e1e',
        tabActive: '#333',
        tabInactive: '#272727',
        card: '#222',
        buttonPrimary: '#60a5fa', // Lighter blue for dark mode
        buttonPrimaryText: '#fff',
        buttonSecondary: '#f44336', // Slightly different red for dark mode
        buttonSecondaryText: '#fff',
        buttonError: '#ff9800', // Slightly different orange for dark mode
        buttonErrorText: '#fff',
        tabTextActive: '#eee',
        tabTextInactive: '#bbb',
        cardBackground: '#222',
        cardContentBackground: '#222',
        inputBackground: '#333',
        inputBorder: '#555',
        inputTextColor: '#eee',
    };

    const currentMode = isDarkMode ? darkMode : lightMode;

    const customButtonStyles = {
        container: {
            margin: '0',
        },
        button: {
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease', // Add transition for smoother hover effect
        },
        connectButton: {
            backgroundColor: currentMode.buttonPrimary,
            color: currentMode.buttonPrimaryText,
            '&:hover': { // Example of hover effect, adjust as needed
                backgroundColor: lightMode.buttonPrimary, // Slightly lighter on hover for light mode, adjust darkMode as needed
            },
        },
        disconnectButton: {
            backgroundColor: currentMode.buttonSecondary,
            color: currentMode.buttonSecondaryText,
            '&:hover': {
                backgroundColor: lightMode.buttonSecondary,
            },
        },
        errorButton: {
            backgroundColor: currentMode.buttonError,
            color: currentMode.buttonErrorText,
            '&:hover': {
                backgroundColor: lightMode.buttonError,
            },
        },
    };

    const getConfigKey = useCallback((config: EasyaConfig) => {
        return `${config.network}-${config.blockchain}-${config.wallet}`;
    }, []);

    return (
        <EasyaSDK.BlockchainProvider
            config={blockchainConfig}
            key={getConfigKey(blockchainConfig)}
        >
            <div className="app-container" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: currentMode.background,
                color: currentMode.text,
                fontFamily: 'Arial, sans-serif', // Consistent font
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
                            <EasyaSDK.BalanceDisplay />
                        </div>
                        <div style={{ marginRight: '30px', fontSize: '16px' }}>
                            <EasyaSDK.AddressDisplay
                                className="custom-address-display"
                            />
                        </div>
                        <div className="connect-button-container" style={{ marginRight: '20px' }}> {/* Added margin for better spacing */}
                            <EasyaSDK.ConnectButton
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
                            fontSize: '16px', // Consistent font size
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
                        borderRadius: '12px', // More rounded corners for cards
                        boxShadow: isDarkMode ? '0 2px 5px rgba(0,0,0,0.7)' : '0 2px 5px rgba(0,0,0,0.1)', // Slightly stronger shadow
                        marginBottom: '30px', // More margin below cards
                    }}>
                        <div className="card-content" style={{ padding: '30px', backgroundColor: currentMode.cardContentBackground }}>
                            <div className="content-section">
                                {/* Tab Content */}
                                {activeTab === 'sendToken' && (
                                    <>
                                        {/* Balance and Address are now in AppBar */}
                                        <EasyaSDK.TransactionForm
                                        />
                                    </>
                                )}
                                {activeTab === 'issueToken' && (
                                    <EasyaSDK.IssueTokenForm

                                    />
                                )}
                                {activeTab === 'trustLines' && (
                                    <EasyaSDK.TrustLineForm
                                    />
                                )}
                                {/* ADD BALANCE DISPLAY HERE */}
                                {activeTab === 'tokenBalances' && (
                                    <>
                                        <EasyaSDK.BalancesDisplay />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EasyaSDK.BlockchainProvider>
    );
};

export default App;