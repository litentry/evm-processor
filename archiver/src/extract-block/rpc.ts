import * as ethers from 'ethers';
import config from '../config';
import { ExtractBlock } from '../types';

const provider = new ethers.providers.JsonRpcProvider(config.extractEndpoint);

async function getReceipts(transactionHashes: string[]) {
  const receipts = await Promise.all(
    transactionHashes.map(async (hash) => {
      const receipt = await provider.getTransactionReceipt(hash);

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
  const { transactions, hash: blockHash } =
    await provider.getBlockWithTransactions(blockNumber);

  const receipts = await getReceipts(transactions.map((tx) => tx.hash));

  return {
    blockNumber,
    blockHash,
    transactions,
    receipts,
  };
};

export default rpc;
