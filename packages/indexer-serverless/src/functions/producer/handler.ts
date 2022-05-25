import { SQS } from 'aws-sdk';
import mongoose from 'mongoose';
import getLatestBlock from '../../util/get-latest-block';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';
import { SendMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';

const sqs = new SQS();
const maxBlocksToQueuePerExecution = 50000;

interface BatchSQSMessage {
  Id: string;
  MessageBody: string;
}

export default async function producer() {
  await mongoose.connect(process.env.MONGO_URI!);

  const existingLastQueuedEndBlock = await getLastQueuedEndBlock();

  let lastQueuedEndBlock = existingLastQueuedEndBlock || 0;

  const targetBlockHeight =
    process.env.END_BLOCK !== 'undefined'
      ? parseInt(process.env.END_BLOCK!)
      : await getLatestBlock(process.env.LATEST_BLOCK_DEPENDENCY!)();

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
    await sqs
      .sendMessageBatch({
        QueueUrl: process.env.QUEUE_URL!,
        Entries: jobs,
      })
      .promise();

    lastQueuedEndBlock = Number(jobs[jobs.length - 1].Id);

    await saveLastQueuedEndBlock(lastQueuedEndBlock);
  };

  let pendingJobs: SendMessageBatchRequestEntry[] = [];
  for (let i = lastQueuedEndBlock + 1; i <= targetLastQueuedEndBlock; i++) {
    const startBlock = i;
    const endBlock = Math.min(
      i + parseInt(process.env.BATCH_SIZE!),
      targetLastQueuedEndBlock,
    );
    pendingJobs.push({
      Id: `${endBlock}`,
      MessageBody: JSON.stringify({ startBlock, endBlock }),
      MessageGroupId: '0',
    });
    i = endBlock;

    if (pendingJobs.length === 10 || i === targetLastQueuedEndBlock) {
      await dispatch(pendingJobs);
      pendingJobs = [];
    }
  }

  await mongoose.disconnect();

  console.log(
    `Queued ${targetJobCount} jobs. Last job end block: ${targetLastQueuedEndBlock}`,
  );
}
