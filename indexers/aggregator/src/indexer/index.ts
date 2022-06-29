import { indexer, Types } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import { MarketActivity } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  console.log('starting');
  const data = await extract(startBlock, endBlock);
  console.log(data);

  return indexer<Types.Archive.ContractTransactionWithLogs[], MarketActivity[]>(
    startBlock,
    endBlock,
    extract,
    transform,
  );
  // return indexer<
  //   Types.Archive.Log[][],
  //   Types.Contract.DecodedContractEvent[][]
  // >(startBlock, endBlock, extract, transform, load);
}

handler(2000000, 2000099);
