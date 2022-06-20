type Batch = { startBlock: number; endBlock: number };

export default function createBatches(
  startBlock: number,
  endBlock: number,
  batchSize: number,
): Batch[] {
  const batches: Batch[] = [];
  let batchStartBlock = startBlock;

  while (batchStartBlock <= endBlock) {
    let batchEndBlock = batchStartBlock + batchSize - 1;

    if (batchEndBlock > endBlock) {
      batchEndBlock = endBlock;
    }

    batches.push({
      startBlock: batchStartBlock,
      endBlock: batchEndBlock,
    });
    batchStartBlock = batchEndBlock + 1;
  }

  return batches;
}
