import {
  deleteIndexedBlockRanges,
  getIndexedBlockRanges,
  IndexedBlockRangeDocument,
} from '../repository/indexed-block-range-repository';
import {
  getLastIndexedBlock,
  saveLastIndexedBlock,
} from '../repository/last-indexed-block-repository';

export const calculateLastIndexedBlock = async () => {
  let lastIndexedBlock = await getLastIndexedBlock();
  const processedIndexedBlockRanges: IndexedBlockRangeDocument[] = [];
  const pendingIndexedBlockRanges = await getIndexedBlockRanges();

  pendingIndexedBlockRanges.forEach((pendingIndexedBlockRange) => {
    if ((lastIndexedBlock || 0) + 1 < pendingIndexedBlockRange.startBlock) {
      return;
    }

    processedIndexedBlockRanges.push(pendingIndexedBlockRange);

    lastIndexedBlock = pendingIndexedBlockRange.endBlock;
  });

  if (processedIndexedBlockRanges.length > 0 && lastIndexedBlock !== null) {
    await saveLastIndexedBlock(lastIndexedBlock);
    await deleteIndexedBlockRanges(processedIndexedBlockRanges);
  }
};
