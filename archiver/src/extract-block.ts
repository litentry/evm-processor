import config from './config';
import { ExtractBlock } from './types';

async function getReceipts(transactionHashes: string[]) {
  const receipts = await Promise.all(
    transactionHashes.map(async (hash) => {
      const receipt = await config.web3.eth.getTransactionReceipt(hash);

      if (!receipt) {
        // some providers fail to provide receipts
        throw new Error(`Failed to fetch receipt for tx: ${hash}`);
      }
      return receipt;
    })
  );
  return receipts;
}

const rpc: ExtractBlock = async (blockNumber) => {
  const blockWithTransactions = await config.web3.eth.getBlock(
    blockNumber,
    true
  );
  const receipts = await getReceipts(
    blockWithTransactions.transactions.map((tx) => tx.hash)
  );

  return {
    blockWithTransactions,
    receipts,
  };
};

export default rpc;
