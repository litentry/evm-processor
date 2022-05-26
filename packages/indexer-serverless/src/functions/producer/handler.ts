import { SQS } from 'aws-sdk';
import { metrics, monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';
import getLatestBlock from '../../util/get-latest-block';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

const sqs = new SQS();
const maxBlocksToQueuePerExecution = 50000;

type BlockBatch = {
  startBlock: number;
  endBlock: number;
};

interface BatchSQSMessage {
  Id: string;
  MessageBody: string;
}

export default async function producer() {
  await mongoose.connect(process.env.MONGO_URI!);

  monitoring.markStart(metrics.getLastQueuedBlock);
  const existingLastQueuedEndBlock = await getLastQueuedEndBlock();
  monitoring.markEnd(metrics.getLastQueuedBlock);

  let lastQueuedEndBlock = existingLastQueuedEndBlock || 0;

  const targetBlockHeight =
    process.env.END_BLOCK !== 'undefined'
      ? parseInt(process.env.END_BLOCK!)
      : await getLatestBlock(process.env.LATEST_BLOCK_DEPENDENCY!)();

  const maxWorkers = parseInt(process.env.MAX_WORKERS!) || 1;
  const batchSize = parseInt(process.env.BATCH_SIZE!);

  console.log({
    lastQueuedEndBlock,
    targetBlockHeight,
    existingLastQueuedEndBlock,
  });

  if (targetBlockHeight < lastQueuedEndBlock) {
    console.log(`Last queued message is up to the target block height`);
    return;
  }

  const targetJobCount = Math.min(
    maxBlocksToQueuePerExecution,
    targetBlockHeight - lastQueuedEndBlock,
  );
  const targetLastQueuedEndBlock = lastQueuedEndBlock + targetJobCount;

  const dispatch = async (jobs: BatchSQSMessage[]) => {
    if (jobs.length) {
      await sqs
        .sendMessageBatch({
          QueueUrl: process.env.QUEUE_URL!,
          Entries: jobs,
        })
        .promise();
    }
  };

  monitoring.markStart(metrics.batchBlocks);
  while (true) {
    let batches = batchBlocks(
      lastQueuedEndBlock === 0 ? 0 : lastQueuedEndBlock + 1,
      targetLastQueuedEndBlock,
      batchSize,
      10,
    );

    const dispatches = batches.batches.map((b) => {
      let workerGroup = 0;
      const blocksInBatch = b.endBlock + 1 - b.startBlock;
      // For sanity only set a different worker group if the block range in
      // this batch is the same length as the configured batch size,
      // otherwise use group 0
      if (blocksInBatch === batchSize) {
        const batchGroup = b.startBlock % (maxWorkers * batchSize);
        workerGroup = batchGroup / maxWorkers;
      }
      return {
        Id: `${b.endBlock}`,
        MessageBody: JSON.stringify(b),
        MessageGroupId: `${workerGroup}`,
      };
    });

    await dispatch(dispatches);
    monitoring.markEnd(metrics.batchBlocks);

    lastQueuedEndBlock = batches.lastBlock;

    monitoring.markStart(metrics.saveLastQueuedBlock);
    await saveLastQueuedEndBlock(lastQueuedEndBlock);
    monitoring.markEnd(metrics.saveLastQueuedBlock);

    if (lastQueuedEndBlock >= targetLastQueuedEndBlock) {
      break;
    }
  }

  monitoring.measure(metrics.getLastQueuedBlock);
  monitoring.measure(metrics.batchBlocks);
  monitoring.measure(metrics.saveLastQueuedBlock);

  await monitoring.pushMetrics();

  await mongoose.disconnect();

  console.log(
    `Queued ${targetJobCount} jobs. Last job end block: ${targetLastQueuedEndBlock}`,
  );
}

function batchBlocks(
  startBlock: number,
  endBlock: number,
  batchSize: number,
  numberOfBatches: number = 10,
): {
  lastBlock: number;
  batches: BlockBatch[];
} {
  let batches: BlockBatch[] = [];
  let batchStartBlock = startBlock;

  while (batchStartBlock <= endBlock && batches.length < numberOfBatches) {
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
  console.log('batchBlocks', {
    batches,
    lastBlock: batchStartBlock - 1,
  });
  return {
    batches,
    lastBlock: batchStartBlock - 1,
  };
}
