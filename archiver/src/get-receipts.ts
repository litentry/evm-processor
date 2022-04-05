import * as ethers from 'ethers';

export async function getReceipts(
  provider: ethers.providers.JsonRpcProvider,
  transactionHashes: string[]
) {
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
