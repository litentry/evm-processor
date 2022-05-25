import { SQS } from 'aws-sdk';
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
  console.log(process.env);
  await mongoose.connect(process.env.MONGO_URI!);

  // put back in condition
  const latestBlockHeight = await getLatestBlock(
    process.env.LATEST_BLOCK_DEPENDENCY!,
  )();

  const existingLastQueuedEndBlock = await getLastQueuedEndBlock();
  console.log('existingLastQueuedEndBlock', existingLastQueuedEndBlock);
  console.log('latestBlockHeight', latestBlockHeight);

  let lastQueuedEndBlock = existingLastQueuedEndBlock || 0;

  const targetBlockHeight =
    typeof process.env.END_BLOCK !== 'undefined'
      ? parseInt(process.env.END_BLOCK)
      : latestBlockHeight;

  console.log({ lastQueuedEndBlock, targetBlockHeight });

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
    await sqs
      .sendMessageBatch({
        QueueUrl: process.env.QUEUE_URL!,
        Entries: jobs,
      })
      .promise();
  };

  while (true) {
    let batches = batchBlocks(
      lastQueuedEndBlock === 0 ? 0 : lastQueuedEndBlock + 1,
      targetLastQueuedEndBlock,
      parseInt(process.env.BATCH_SIZE!),
      10,
    );

    await dispatch(
      batches.batches.map((b) => ({
        Id: `${b.endBlock}`,
        MessageBody: JSON.stringify(b),
      })),
    );

    lastQueuedEndBlock = batches.lastBlock;

    await saveLastQueuedEndBlock(lastQueuedEndBlock);

    if (lastQueuedEndBlock >= targetLastQueuedEndBlock) {
      break;
    }
  }

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

  return {
    batches,
    lastBlock: batchStartBlock - 1,
  };
}
