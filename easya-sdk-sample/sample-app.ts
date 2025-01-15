import { EasyaSDK } from '../src/index';  

async function runSampleApp() {
    console.log('Starting EasyaSDK Sample Application...');
    
    try {
        // Initialize the SDK
        const sdk = new EasyaSDK();
        console.log('EasyaSDK initialized successfully');

        // Connect to the blockchain
        console.log('Connecting to XRPL testnet...');
        const connectionResult = await sdk.connect();
        console.log('Successfully connected to blockchain:', connectionResult);

        // Here you can add more functionality using the SDK
        // For example:
        // - Create transactions
        // - Query blockchain data
        // - Interact with smart contracts
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Start the sample application
console.log('=== EasyaSDK Sample Application ===');
runSampleApp().then(() => {
    console.log('Sample application completed');
}).catch((error) => {
    console.error('Sample application failed:', error);
});
