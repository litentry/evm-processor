import { indexer } from 'indexer-utils';
import extract from './extract';
import load from './load';
import transform from './transform';
import { ExtractedTransfers, TransformedTransfers } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedTransfers, TransformedTransfers>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}

handler(2000000, 2000099);
