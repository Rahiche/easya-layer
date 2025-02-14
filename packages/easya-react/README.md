# @easya/layer-ui-react

A React component library for building blockchain applications with ease, focusing on XRPL integration (more coming soon).

## Features

- 🔗 Seamless blockchain connectivity
- 💰 Token management components
- 🎨 Dark/Light mode support
- 🔐 Wallet integration
- 📊 Balance display components
- 🔄 Transaction handling

## Installation

```bash
npm install @easya/layer-ui-react
# or
yarn add @easya/layer-ui-react
```

## Quick Start

```typescript
import { BlockchainProvider, ConnectButton } from '@easya/layer-ui-react';

const config = {
  network: 'testnet',
  blockchain: 'xrpl',
  wallet: 'crossmark'
};

function App() {
  return (
    <BlockchainProvider config={config}>
      <ConnectButton />
    </BlockchainProvider>
  );
}
```


## Core Components:

- `BlockchainProvider` - Provides blockchain context to all components
- `ConnectButton` - Button to connect/disconnect wallet
- `AddressDisplay` - Shows wallet address
- `BalanceDisplay` - Shows XRP balance
- `BalancesDisplay` - Shows all token balances
- `TransactionForm` - Send tokens/XRP
- `IssueTokenForm` - Create new fungible tokens
- `TrustLineForm` - Create token trust lines



## Setup

1. create a react app:
`npm create vite@latest your-project-name -- --template react`

2. `cd your-project-name`
3. `npm install`
4. `npm i @easya/layer-ui-react`
5. now, we can start using it! update App.jx content to:

```typescript
import { BlockchainProvider, ConnectButton } from '@easya/layer-ui-react';

const config = {
  network: 'testnet',
  blockchain: 'xrpl',
  wallet: 'crossmark'
};

function App() {
  return (
    <BlockchainProvider config={config}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ConnectButton />
      </div>
    </BlockchainProvider>
  );
}

export default App;
```


6. `npm run dev`


## Setup a full functional sample


1. clone the starter repo

https://github.com/EasyA-Tech/easya-layer-starter-react


2. npm install
3. npm start

4. You can now start modifing the starter app 
