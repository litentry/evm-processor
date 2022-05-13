import { LastIndexedBlockModel } from '../../../src/schema';

export const getLastQueuedEndBlock = async (
  indexer: string
): Promise<number | null> => {
  const currentValue = await LastIndexedBlockModel.findOne({
    id: indexer,
  }).exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('number') as number;
};

export const saveLastQueuedEndBlock = async (
  indexer: string,
  lastQueuedEndBlock: number
): Promise<void> => {
  const currentValue = await LastIndexedBlockModel.findOne({
    id: indexer,
  }).exec();
  if (!currentValue) {
    await LastIndexedBlockModel.create({
      id: indexer,
      number: lastQueuedEndBlock,
    });
    return;
  }
  await currentValue.update({
    number: lastQueuedEndBlock,
  });
};
