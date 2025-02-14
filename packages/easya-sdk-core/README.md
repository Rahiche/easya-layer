# @easya/layer-js

**Effortless Blockchain Interactions for XRPL & Aptos.**

A simple JavaScript SDK to interact with XRPL and Aptos blockchains. Simplify transactions, NFTs, and more!


**Key Features:**

*   Unified API for XRPL & Aptos
*   Simplified Transactions & NFT Management
*   Wallet Connection & Event Subscription
*   React-Friendly


**Installation:**

```bash
npm install @easya/layer-js
```


**Basic Usage:**

1.  **Import & Configure:**

```javascript
import { EasyaSDK } from '@easya/layer-js';
import { EasyaConfig } from '@easya/layer-js/core/types';

const config: EasyaConfig = {
    blockchain: 'XRPL', // or 'Aptos'
    network: 'TESTNET',
    wallet: 'Xumm'
};

const easyaSDK = new EasyaSDK(config);
await easyaSDK.connect();
const address = await easyaSDK.getAddress();
console.log('Connected Address:', address);

```


**Example: Get Balance**

```javascript
const balance = await easyaSDK.getBalance();
console.log('Balance:', balance, easyaSDK.getCurrencySymbol());
```


```javascript
import { TransactionConfig } from '@easya/layer-js/core/types';

const transactionConfig: TransactionConfig = {
    to: 'rRecipientAddress...',
    amount: '10'
};
const result = await easyaSDK.sendTransaction(transactionConfig);
console.log('Transaction Result:', result);
```



**React Example:**


```jsx
import React, { useState, useEffect } from 'react';
import { EasyaSDK } from '@easya/layer-js';
import { EasyaConfig } from '@easya/layer-js/core/types';

const config: EasyaConfig = { blockchain: 'XRPL', network: 'TESTNET', wallet: 'Xumm' };
const easyaSDK = new EasyaSDK(config);

function BlockchainComponent() {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        async function fetchBalance() {
            await easyaSDK.connect(); // Connect in useEffect
            const bal = await easyaSDK.getBalance();
            setBalance(bal);
            easyaSDK.disconnect(); // Disconnect on unmount or after fetching
        }
        fetchBalance();
    }, []);

    return (
        <div>
            <p>Balance: {balance} {easyaSDK.getCurrencySymbol()}</p>
        </div>
    );
}
export default BlockchainComponent;
```