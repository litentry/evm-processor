import axios from 'axios';
import { BigNumber } from 'ethers';
import { metrics, monitoring } from 'indexer-monitoring';
import throat from 'throat';
import { ExtractBlock, RawBlock, RawReceipt } from '../types';

const throttle = throat(750);

const extractBlock: ExtractBlock = async (number) => {
  if (!process.env.RPC_ENDPOINT) {
    throw new Error('RPC_ENDPOINT not set');
  }
  const endpoint = process.env.RPC_ENDPOINT;
  const blockHex = `0x${number.toString(16)}`;

  const blockResponse = await axios.post(endpoint, {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [blockHex, true],
    id: 1,
  });
  const blockWithTransactions = blockResponse.data.result as RawBlock;

  const receipts = await getReceipts(
    endpoint,
    blockWithTransactions.transactions.map((tx) => tx.hash),
  );

  return {
    blockWithTransactions,
    receipts,
  };
};

async function getReceipts(endpoint: string, transactionHashes: string[]) {
  const receipts = transactionHashes.map((hash) =>
    throttle(async () => {
      const startTimer = Date.now();
      const receiptsResponse = await axios.post(endpoint, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [hash],
        id: 1,
      });

      const receipt = receiptsResponse.data.result;
      const time = Date.now() - startTimer;

      monitoring.observe(time, metrics.rpcCalls);

      if (!receipt) {
        // some providers fail to provide receipts
        throw new Error(
          `Failed to fetch receipt for tx: ${hash}. You must provide an RPC_ENDPOINT for a full archive node.`,
        );
      }
      return receipt as RawReceipt;
    }),
  );
  return Promise.all(receipts);
}

export default extractBlock;
