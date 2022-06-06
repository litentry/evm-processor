import axios from 'axios';
import { AnkrBlock } from './ankr-types';

export default async function extractAnkrBlock(number: number) {
  const data = await axios.post('https://rpc.ankr.com/multichain', {
    jsonrpc: '2.0',
    method: 'ankr_getBlocksRange',
    params: {
      blockchain: 'eth',
      fromBlock: number,
      toBlock: number,
    },
    id: 1,
  });

  return data.data.result.blocks[0] as AnkrBlock;
}
