import { createWeb3Instance, web3 } from './web3'

jest.mock('web3-core-requestmanager');

describe('createWeb3Instance', () => {
  it('should return a web3 instance when RPC_ENDPOINT is not a Websocket', () => {
    process.env.RPC_ENDPOINT = 'http://something.local';
    const w3 = createWeb3Instance();
    expect(w3).toHaveProperty('eth');
  });

  it('should return a web3 instance when RPC_ENDPOINT is a Websocket', () => {
    process.env.RPC_ENDPOINT = 'ws://something.local';
    const w3 = createWeb3Instance();
    expect(w3).toHaveProperty('eth');
  });

  it('should throw when RPC_ENDPOINT not set', () => {
    process.env.RPC_ENDPOINT = '';
    expect(() => createWeb3Instance()).toThrowError();
  });
});
