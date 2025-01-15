# EasyaSDK Sample Project

This repository demonstrates the integration and usage of EasyaSDK with React for blockchain interactions on the XRPL testnet.

## Features

- Wallet connection management
- Balance display
- Address display
- NFT minting capabilities
- NFT transfer functionality
- NFT gallery visualization
- Transaction management

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Rahiche/easya-layer.git
```

Navigate to the project directory:

```bash
cd easya-sdk-starter
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

## Sample Implementation

Here's how to create a basic implementation using EasyaSDK. This allows you to connect or disconnect from a default wallet and display the account balance in the native currency:

```tsx
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
                                <h1 className="title">EasyaSDK Demo</h1>
                                <div className="components-container">
                                    <EasyaSDK.ConnectButton />
                                    <EasyaSDK.BalanceDisplay />
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
```

## Available Components

- **BlockchainProvider**: Provides blockchain context to all child components
- **ConnectButton**: Handles wallet connection/disconnection
- **BalanceDisplay**: Shows current wallet balance
- **AddressDisplay**: Displays connected wallet address
- **NFTMintingForm**: Interface for minting new NFTs
- **NFTTransferForm**: Interface for transferring NFTs
- **NFTGallery**: Displays owned NFTs
- **TransactionForm**: Handles general transactions

## Configuration

The SDK is configured to work with the XRPL testnet by default. You can modify the `blockchainConfig` object to change network settings:

```typescript
const blockchainConfig: EasyaConfig = {
    network: 'testnet', // or 'mainnet'
    blockchain: 'xrpl',
};
```
