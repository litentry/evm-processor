import { indexer, Types } from 'indexer-utils';
import extract from './extract';
import load from './load';
import transform from './transform';
import { MarketActivity } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  console.log('starting');
  const data = await extract(startBlock, endBlock);
  console.log(data);

  return indexer<
    Types.Archive.ContractTransaction[],
    {
      yearly: MarketActivity[];
      monthly: MarketActivity[];
      daily: MarketActivity[];
    }
  >(startBlock, endBlock, extract, transform, load);
}

handler(2000000, 2000099);
