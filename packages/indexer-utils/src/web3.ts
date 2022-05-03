import colors from 'colors';
import Web3 from 'web3';
import { HttpProvider, WebsocketProvider } from 'web3-core';

if (!process.env.RPC_ENDPOINT) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.RPC_ENDPOINT must be an RPC provider, ignore this if you are not making chain node calls in your indexer'
    )}\n`
  );
}

console.log(process.env.RPC_ENDPOINT);
let provider: WebsocketProvider | HttpProvider;

if (process.env.RPC_ENDPOINT?.startsWith('ws')) {
  provider = new Web3.providers.WebsocketProvider(process.env.RPC_ENDPOINT);
} else {
  provider = new Web3.providers.HttpProvider(process.env.RPC_ENDPOINT!);
}

const web3 = new Web3(provider);

export default web3;
