import { indexer, Types } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';
import { TransformResult } from './types';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<Types.Archive.ContractCreationTransaction[], TransformResult>(
    startBlock,
    endBlock,
    extract,
    transform,
    load,
  );
}
