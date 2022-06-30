import { indexer } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';
import { ExtractedNFTData, TransformedNFTData } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedNFTData, TransformedNFTData>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
