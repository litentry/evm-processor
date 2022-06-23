import { indexer } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';
import { ExtractedData, Swap } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedData, Swap[]>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
