import { indexer } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';
import { ExtractedBlock, TransformedBlock } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedBlock[], TransformedBlock[]>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
