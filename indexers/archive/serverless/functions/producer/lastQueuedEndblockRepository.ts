import { LastIndexedBlockModel } from "../../../src/schema";

export const getLastQueuedEndBlock = async (index: string): Promise<number | null> => {
  const currentValue = await LastIndexedBlockModel.findOne({
    id: index
  }).exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('number') as number;
}

export const saveLastQueuedEndBlock = async (index: string, lastQueuedEndBlock: number): Promise<void> => {
  const currentValue = await LastIndexedBlockModel.findOne({
    id: index
  }).exec();
  if (!currentValue) {
    await LastIndexedBlockModel.create({
      id: index,
      number: lastQueuedEndBlock
    });
    return;
  }
  await currentValue.update({
    number: lastQueuedEndBlock
  });
}