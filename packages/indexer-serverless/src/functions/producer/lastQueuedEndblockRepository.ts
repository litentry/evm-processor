import { repository } from 'indexer-utils';

export const getLastQueuedEndBlock = async (): Promise<number | null> => {
  const currentValue = await repository.lastQueuedBlock.Model.findOne().exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('number') as number;
};

export const saveLastQueuedEndBlock = async (
  lastQueuedEndBlock: number,
): Promise<void> => {
  await repository.lastQueuedBlock.Model.findOneAndUpdate(
    {},
    { $set: { number: lastQueuedEndBlock } },
    { upsert: true },
  );
};
