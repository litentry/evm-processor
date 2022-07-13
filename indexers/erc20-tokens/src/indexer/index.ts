import { indexer, Types } from 'indexer-utils';
import extract from './extract';
import load from './load';
import transform from './transform';
import { ExtractedData } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<ExtractedData, Types.Erc20.Transfer[]>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
