import { metrics, monitoring } from 'indexer-monitoring';
import { web3 } from 'indexer-utils';
import { ExtractBlock } from './types';
import throat from 'throat';

const throttle = throat(750);

async function getReceipts(transactionHashes: string[]) {
  const receipts = transactionHashes.map((hash) =>
    throttle(async () => {
      const startTimer = Date.now();
      const receipt = await web3.eth.getTransactionReceipt(hash);
      const time = Date.now() - startTimer;

      monitoring.observe(time, metrics.rpcCalls);

      if (!receipt) {
        // some providers fail to provide receipts
        throw new Error(
          `Failed to fetch receipt for tx: ${hash}. You must provide an RPC_ENDPOINT for a full archive node.`,
        );
      }
      return receipt;
    }),
  );
  return Promise.all(receipts);
}
async function getTransactions(transactionHashes: string[]) {
  const receipts = transactionHashes.map((hash) =>
    throttle(async () => {
      const startTimer = Date.now();
      const receipt = await web3.eth.getTransaction(hash);
      const time = Date.now() - startTimer;

      monitoring.observe(time, metrics.rpcCalls);

      if (!receipt) {
        // some providers fail to provide receipts
        throw new Error(
          `Failed to fetch receipt for tx: ${hash}. You must provide an RPC_ENDPOINT for a full archive node.`,
        );
      }
      return receipt;
    }),
  );
  return Promise.all(receipts);
}

const rpc: ExtractBlock = async (blockNumber) => {
  const block = await web3.eth.getBlock(blockNumber);
  const receipts = await getReceipts(block.transactions);
  const transactions = await getTransactions(block.transactions);

  return {
    blockWithTransactions: {
      ...block,
      transactions,
    },
    receipts,
  };
};

export default rpc;
