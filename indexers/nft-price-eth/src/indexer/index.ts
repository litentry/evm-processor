import { indexer } from 'indexer-utils';
import extract from './extract';
import load from './load';
import transform from './transform';
import { ExtractedNFTPriceData, TransformedNFTPriceData } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedNFTPriceData, TransformedNFTPriceData>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
