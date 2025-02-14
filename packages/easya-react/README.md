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

`BlockchainProvider` - Provides blockchain context to all components
`ConnectButton` - Button to connect/disconnect wallet
`AddressDisplay` - Shows wallet address
`BalanceDisplay` - Shows XRP balance
`BalancesDisplay` - Shows all token balances
`TransactionForm` - Send tokens/XRP
`IssueTokenForm` - Create new fungible tokens
`TrustLineForm` - Create token trust lines