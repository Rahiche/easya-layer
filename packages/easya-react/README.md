# EasyA SDK Integration Guide

Quick guide to get started with EasyA SDK in your React application.

## Installation

Install the EasyA SDK package in your React project:

```bash
npm install @easya/react
```

## Basic Implementation
Here's a minimal example showing how to integrate the EasyA SDK with a connect button:

```tsx
const App = () => {
    return (
        <EasyaSDK.BlockchainProvider config={blockchainConfig}>
            <div style={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <h1>My Web3 App</h1>
                <EasyaSDK.ConnectButton />
            </div>
        </EasyaSDK.BlockchainProvider>
    );
};
```

