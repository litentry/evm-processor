import { indexer } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';
import { ERC20Transfer, ExtractedData } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedData, ERC20Transfer[]>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
