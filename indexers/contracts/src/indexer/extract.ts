import { query, Types, utils } from 'indexer-utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<Types.Archive.ContractCreationTransaction[]> {
  const batches = utils.createBatches(startBlock, endBlock, 20);

  const results = await Promise.all(
    batches.map(async (batch) => {
      return query.archive.contractCreationTransactions({
        startBlock: batch.startBlock,
        endBlock: batch.endBlock,
        properties: [
          'receiptContractAddress',
          'from',
          'blockNumber',
          'blockTimestamp',
          'input',
        ],
      });
    }),
  );

  const txs = results.flatMap((txArr) => txArr);

  return txs;
}
