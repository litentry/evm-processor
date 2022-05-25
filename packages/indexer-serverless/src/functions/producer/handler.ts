import { SQS } from 'aws-sdk';
import { monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';
import getLatestBlock from '../../util/get-latest-block';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

const sqs = new SQS();
const maxBlocksToQueuePerExecution = 50000;

interface BatchSQSMessage {
  Id: string;
  MessageBody: string;
}

export default async function producer() {
  try {
    monitoring.mark('start-connect-mongo');
    console.log(process.env);
    await mongoose.connect(process.env.MONGO_URI!);
    monitoring.mark('end-connect-mongo');

    // put back in condition
    monitoring.mark('start-get-latest-block');
    const latestBlockHeight = await getLatestBlock(
      process.env.LATEST_BLOCK_DEPENDENCY!,
    )();
    monitoring.mark('end-get-latest-block');

    monitoring.mark('start-last-queued-end-block');
    const existingLastQueuedEndBlock = await getLastQueuedEndBlock();
    monitoring.mark('end-last-queued-end-block');
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

      lastQueuedEndBlock = Number(jobs[jobs.length - 1].Id);

      await saveLastQueuedEndBlock(lastQueuedEndBlock);
    };

    let pendingJobs = [];

    monitoring.mark('start-enqueue-batches');
    for (let i = lastQueuedEndBlock + 1; i <= targetLastQueuedEndBlock; i++) {
      const startBlock = i;
      const endBlock = Math.min(
        i + parseInt(process.env.BATCH_SIZE!),
        targetLastQueuedEndBlock,
      );
      pendingJobs.push({
        Id: `${endBlock}`,
        MessageBody: JSON.stringify({ startBlock, endBlock }),
      });
      i = endBlock;

      if (pendingJobs.length === 10 || i === targetLastQueuedEndBlock) {
        await dispatch(pendingJobs);
        pendingJobs = [];
      }
    }
    monitoring.mark('end-enqueue-batches');

    console.log(
      `Queued ${targetJobCount} jobs. Last job end block: ${targetLastQueuedEndBlock}`,
    );
  } catch (error) {
  } finally {
    await mongoose.disconnect();

    monitoring.measure('start-connect-mongo', 'end-connect-mongo', {
      functionName: 'connectMongo',
    });
    monitoring.measure('start-get-latest-block', 'end-get-latest-block', {
      functionName: 'latestBlock',
    });
    monitoring.measure(
      'start-last-queued-end-block',
      'end-last-queued-end-block',
      {
        functionName: 'getLastQueuedEndBlock',
      },
    );
    monitoring.measure('start-enqueue-batches', 'end-enqueue-batches', {
      functionName: 'enqueueBatches',
    });

    await monitoring.pushMetrics();
  }
}
