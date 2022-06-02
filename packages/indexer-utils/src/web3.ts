import colors from 'colors';
import Web3 from 'web3';
import { HttpProvider, WebsocketProvider } from 'web3-core';

function createWeb3Instance(): Web3 {
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
    // @ts-ignore
    provider.on('error', (e) => {
      console.error('Fatal Websocket error');
      throw new Error(e);
    });

  } else {
    provider = new Web3.providers.HttpProvider(
      process.env.RPC_ENDPOINT!,
      {
        keepAlive: false,
        timeout: 10000,
      }
    );
  }

  return new Web3(provider);
}

let cachedWeb3: Web3;

export default function web3(): Web3 {
  if (!cachedWeb3) {
    cachedWeb3 = createWeb3Instance();
  }
  return cachedWeb3;
}

