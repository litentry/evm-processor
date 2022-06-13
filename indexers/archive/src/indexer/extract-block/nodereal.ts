import axios from 'axios';
import { BigNumber } from 'ethers';
import { metrics, monitoring } from 'indexer-monitoring';
import { ExtractBlock, RawBlock, RawReceipt } from '../types';

const extractBlock: ExtractBlock = async (number) => {
  if (!process.env.RPC_ENDPOINT) {
    throw new Error('RPC_ENDPOINT not set');
  }
  const endpoint = process.env.RPC_ENDPOINT;

  const startTimer = Date.now();
  const blockResponse = await axios.post(endpoint, {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [BigNumber.from(number).toHexString(), true],
    id: 1,
  });
  const receiptsResponse = await axios.post(endpoint, {
    jsonrpc: '2.0',
    method: 'nr_getTransactionReceiptsByBlockNumber',
    params: [BigNumber.from(number).toHexString()],
    id: 1,
  });

  const time = Date.now() - startTimer;
  monitoring.observe(time, metrics.rpcCalls);

  return {
    blockWithTransactions: blockResponse.data.result as RawBlock,
    receipts: receiptsResponse.data.result as RawReceipt[],
  };
};

export default extractBlock;
