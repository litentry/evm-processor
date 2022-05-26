import { SQS } from 'aws-sdk';
import mongoose from 'mongoose';
import getLatestBlock from '../../util/get-latest-block';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

const sqs = new SQS();
const maxBlocksToQueuePerExecution = 100;

type BlockBatch = {
  startBlock: number;
  endBlock: number;
};

interface BatchSQSMessage {
  Id: string;
  MessageBody: string;
}

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

export default async function producer() {
  await mongoose.connect(process.env.MONGO_URI!);

  const existingLastQueuedEndBlock = await getLastQueuedEndBlock();

  // always start at -1 so we increment at sstart of the loop
  let lastQueuedEndBlock = existingLastQueuedEndBlock || -1;

  const currentChainHeight =
    process.env.END_BLOCK !== 'undefined'
      ? parseInt(process.env.END_BLOCK!)
      : await getLatestBlock(process.env.LATEST_BLOCK_DEPENDENCY!)();

  const maxWorkers = parseInt(process.env.MAX_WORKERS!) || 1;
  const batchSize = parseInt(process.env.BATCH_SIZE!);

  console.log({
    batchSize,
    lastQueuedEndBlock,
    currentChainHeight,
    existingLastQueuedEndBlock,
  });

  if (currentChainHeight < lastQueuedEndBlock) {
    console.log(`Last queued message is up to the chain height`);
    return;
  }

  const targetJobCount = maxBlocksToQueuePerExecution / batchSize;

  const batches = [];
  for (let i = 0; i < targetJobCount; i++) {
    const batch: BlockBatch = {
      startBlock: lastQueuedEndBlock + 1,
      endBlock: Math.min(currentChainHeight, lastQueuedEndBlock + batchSize),
    };
    batches.push(batch);
    lastQueuedEndBlock = batch.endBlock;
    if (batch.endBlock === currentChainHeight) {
      break;
    }
  }

  const dispatches = batches.map((b) => {
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

  console.log(dispatches);

  await dispatch(dispatches);

  await saveLastQueuedEndBlock(lastQueuedEndBlock);

  await mongoose.disconnect();

  console.log(
    `Queued ${targetJobCount} jobs. Last job end block: ${lastQueuedEndBlock}`,
  );
}
