import { repository } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';

export default async function indexer(startBlock: number, endBlock: number) {
  const data = await extract(startBlock, endBlock);
  await load(transform(data));
  await repository.indexedBlockRange.save(startBlock, endBlock);
}
