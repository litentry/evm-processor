import Web3 from 'web3';
import { WebsocketProvider, HttpProvider } from 'web3-core';

if (!process.env.RPC_ENDPOINT) {
  throw new Error('process.env.RPC_ENDPOINT must be an RPC provider');
}

let provider: WebsocketProvider | HttpProvider;

if (process.env.RPC_ENDPOINT.startsWith('ws')) {
  provider = new Web3.providers.WebsocketProvider(process.env.RPC_ENDPOINT);
} else {
  provider = new Web3.providers.HttpProvider(process.env.RPC_ENDPOINT);
}

const web3 = new Web3(provider);

export default web3;
