import { repository, utils } from 'indexer-utils';
import extractTransactions from './extract-transactions';
import transformV2Swaps from './transform-v2-swaps';
import transformMulticall from './transform-multicall';
import { SwapModel } from '../schema';

export default async function indexer(startBlock: number, endBlock: number) {
  const { v2, v3 } = await extractTransactions(startBlock, endBlock);

  const v2Swaps = v2.map((item) => transformV2Swaps[item.method](item.txs[0]));
  const v3Swaps = v3.map((tx) => transformMulticall(tx));

  await utils.upsertMongoModels(
    SwapModel,
    [...v2Swaps, ...v3Swaps],
    ['transactionHash'],
  );

  await repository.indexedBlockRange.save(startBlock, endBlock);
}
