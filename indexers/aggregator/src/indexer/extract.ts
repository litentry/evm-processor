import { query, Types, utils } from 'indexer-utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<Types.Archive.ContractTransaction[]> {
  const batches = utils.createBatches(startBlock, endBlock, 20);

  const results = await Promise.all(
    batches.map(async (batch) => {
      return query.archive.contractTransactions({
        startBlock: batch.startBlock,
        endBlock: batch.endBlock,
        properties: ['blockNumber', 'blockTimestamp', 'gas', 'value'],
      });
    }),
  );

  return results.flatMap((txArr) => txArr);
}
