import { metrics, monitoring } from 'indexer-monitoring';
import { web3 } from 'indexer-utils';
import { ExtractBlock } from './types';
import throat from 'throat';

const throttle = throat(750);

async function getReceipts(transactionHashes: string[]) {
  const receipts = transactionHashes.map((hash) => throttle(async () => {
    const receipt = await web3.eth.getTransactionReceipt(hash);

    if (!receipt) {
      // some providers fail to provide receipts
      throw new Error(
        `Failed to fetch receipt for tx: ${hash}. You must provide an RPC_ENDPOINT for a full archive node.`,
      );
    }
    return receipt;
  }));
  return Promise.all(receipts);
}

const rpc: ExtractBlock = async (blockNumber) => {
  const blockWithTransactions = await web3.eth.getBlock(blockNumber, true);
  const receipts = await getReceipts(
    blockWithTransactions.transactions.map((tx) => tx.hash),
  );

  monitoring.incCounter(
    blockWithTransactions.transactions.length + 1,
    metrics.rpcCalls,
  );

  return {
    blockWithTransactions,
    receipts,
  };
};

export default rpc;
