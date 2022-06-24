import { indexer, Types } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<
    Types.Archive.Log[][],
    Types.Contract.DecodedContractEvent[][]
  >(startBlock, endBlock, extract, transform, load);
}
