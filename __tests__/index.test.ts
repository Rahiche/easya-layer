import { EasyaSDK } from '../src';

describe('EasyaSDK', () => {
  it('should initialize with API key', () => {
    const sdk = new EasyaSDK('test-api-key');
    expect(sdk).toBeInstanceOf(EasyaSDK);
  });

  it('should initialize with custom base URL', () => {
    const sdk = new EasyaSDK('test-api-key', 'https://custom.api.url');
    expect(sdk).toBeInstanceOf(EasyaSDK);
  });
});