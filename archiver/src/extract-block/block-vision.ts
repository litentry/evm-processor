import axios from 'axios';
import * as ethers from 'ethers';
import { BlockWithTransactions } from '@ethersproject/abstract-provider';
import config from '../config';
import { ExtractBlock } from '../types';

async function getReceipts(blockNumber: number) {
  const {
    data: { result: receipts },
  } = await axios.post(config.extractEndpoint, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBlockReceipts',
    params: [blockNumber],
  });

  return receipts as ethers.providers.TransactionReceipt[];
}

async function getBlock(blockNumber: number) {
  const {
    data: { result: blockData },
  } = (await axios.post(config.extractEndpoint, {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [blockNumber, true],
    id: 1,
  })) as { data: { result: BlockWithTransactions } };

  return {
    blockNumber,
    blockHash: blockData.hash,
    transactions: blockData.transactions,
  };
}

const blockVision: ExtractBlock = async (blockNumber) => {
  const [block, receipts] = await Promise.all([
    getBlock(blockNumber),
    getReceipts(blockNumber),
  ]);

  return {
    ...block,
    receipts,
  };
};

export default blockVision;
