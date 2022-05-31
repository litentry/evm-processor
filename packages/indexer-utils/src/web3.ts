import colors from 'colors';
import Web3 from 'web3';
import { HttpProvider, WebsocketProvider } from 'web3-core';

if (!process.env.RPC_ENDPOINT) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.RPC_ENDPOINT must be an RPC provider, ignore this if you are not making chain node calls in your indexer',
    )}\n`,
  );
}

let provider: WebsocketProvider | HttpProvider;

if (process.env.RPC_ENDPOINT?.startsWith('ws')) {
  provider = new Web3.providers.WebsocketProvider(process.env.RPC_ENDPOINT, {
    reconnect: {
      auto: true,
      delay: 1000,
      maxAttempts: 10,
    },
  });
  provider.on('error', () => console.error('WS Error'));
  provider.on('end', () => console.error('WS End'));
} else {
  provider = new Web3.providers.HttpProvider(
    process.env.RPC_ENDPOINT!,
    {
      keepAlive: false,
      timeout: 10000,
    }
  );
}

const web3 = new Web3(provider);

export default web3;
