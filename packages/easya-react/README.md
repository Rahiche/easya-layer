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
import React from 'react';
import * as EasyaSDK from '@easya/react';

// Configure the blockchain settings
const blockchainConfig = {
    network: 'testnet',
    blockchain: 'xrpl',
};

const App = () => {
    return (
        <EasyaSDK.BlockchainProvider config={blockchainConfig}>
            <div>
                <h1>My Web3 App</h1>
                <EasyaSDK.ConnectButton />
            </div>
        </EasyaSDK.BlockchainProvider>
    );
};

export default App;
```

