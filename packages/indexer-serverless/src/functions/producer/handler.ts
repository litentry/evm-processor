import { SQS } from 'aws-sdk';
import { metrics, monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';
import getEnvVar from '../../util/get-env-var';
import getLatestBlock from '../../util/get-latest-block';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

const sqs = new SQS();

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
        QueueUrl: getEnvVar('QUEUE_URL')!,
        Entries: jobs,
      })
      .promise();
  }
};

export default async function producer() {
  monitoring.markStart(metrics.lambdaProducerSuccess);

  try {
    await mongoose.connect(getEnvVar('MONGO_URI')!);

    monitoring.markStart(metrics.lastQueuedBlock);
    const existingLastQueuedEndBlock = await getLastQueuedEndBlock();
    monitoring.markEnd(metrics.lastQueuedBlock);

    // always start at -1 so we increment at start of the loop
    let lastQueuedEndBlock = existingLastQueuedEndBlock || -1;

    const chainHeight = await getLatestBlock(
      getEnvVar('LATEST_BLOCK_DEPENDENCY')!,
    )();

    const targetBlockHeight =
      getEnvVar('END_BLOCK', false) !== 'undefined'
        ? parseInt(getEnvVar('END_BLOCK')!)
        : chainHeight;

    monitoring.gauge(chainHeight, metrics.lastChainBlock);

    const maxWorkers = parseInt(getEnvVar('MAX_WORKERS')!) || 1;
    const batchSize = parseInt(getEnvVar('BATCH_SIZE')!);
    monitoring.gauge(maxWorkers, metrics.lambdaWorkerMaxWorkers);
    monitoring.gauge(batchSize, metrics.lambdaProducerBatchSize);

    const sqsQueueAttributes = await sqs
      .getQueueAttributes({
        QueueUrl: getEnvVar('QUEUE_URL')!,
        AttributeNames: [
          'ApproximateNumberOfMessagesNotVisible',
          'ApproximateNumberOfMessages',
        ],
      })
      .promise();

    const sqsDlqQueueAttributes = await sqs
      .getQueueAttributes({
        QueueUrl: getEnvVar('QUEUE_DLQ_URL')!,
        AttributeNames: ['ApproximateNumberOfMessages'],
      })
      .promise();

    monitoring.gauge(
      parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages),
      metrics.sqsMessageCount,
    );
    monitoring.gauge(
      parseInt(sqsDlqQueueAttributes.Attributes!.ApproximateNumberOfMessages),
      metrics.sqsDlqMessageCount,
    );

    const currentBlocksInQueue =
      (parseInt(
        sqsQueueAttributes.Attributes!.ApproximateNumberOfMessagesNotVisible,
      ) +
        parseInt(sqsQueueAttributes.Attributes!.ApproximateNumberOfMessages)) *
      batchSize;

    const targetTotalQueuedBlocks = parseInt(
      getEnvVar('TARGET_TOTAL_QUEUED_BLOCKS')!,
    );
    const targetJobCount =
      Math.floor(targetTotalQueuedBlocks / batchSize) -
      Math.floor(currentBlocksInQueue / batchSize);

    console.log({
      chainHeight,
      batchSize,
      lastQueuedEndBlock,
      targetBlockHeight,
      existingLastQueuedEndBlock,
      currentBlocksInQueue,
      targetJobCount,
    });

    if (targetBlockHeight <= lastQueuedEndBlock) {
      console.log(`Last queued message is up to the chain height`);
      return;
    }

    const batches = [];
    for (let i = 0; i < targetJobCount; i++) {
      const batch: BlockBatch = {
        startBlock: lastQueuedEndBlock + 1,
        endBlock: Math.min(targetBlockHeight, lastQueuedEndBlock + batchSize),
      };
      batches.push(batch);
      lastQueuedEndBlock = batch.endBlock;
      if (batch.endBlock >= targetBlockHeight) {
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
        workerGroup = (b.startBlock % (maxWorkers * batchSize)) / batchSize;
      }
      return {
        Id: `${b.endBlock}`,
        MessageBody: JSON.stringify(b),
        MessageGroupId: `${workerGroup}`,
      };
    });

    console.log('Messages sent: ', dispatches.length);
    console.log('First message:', dispatches[0]);
    console.log('Last message:', dispatches[dispatches.length - 1]);

    monitoring.markStart(metrics.batchBlocks);
    for (let i = 0; i < dispatches.length; i += 10) {
      await dispatch(dispatches.slice(i, i + 10));
    }
    monitoring.markEnd(metrics.batchBlocks);

    if (existingLastQueuedEndBlock !== lastQueuedEndBlock) {
      monitoring.markStart(metrics.saveLastQueuedBlock);
      await saveLastQueuedEndBlock(lastQueuedEndBlock);
      monitoring.markEnd(metrics.saveLastQueuedBlock);
    }

    console.log(
      `Queued ${dispatches.length} jobs. Last job end block: ${lastQueuedEndBlock}`,
    );
  } catch (error) {
    monitoring.incCounter(1, metrics.lambdaProducerFailure);
    throw error;
  } finally {
    monitoring.measure(metrics.lastQueuedBlock);
    monitoring.measure(metrics.batchBlocks);
    monitoring.measure(metrics.saveLastQueuedBlock);
    monitoring.markEndAndMeasure(metrics.lambdaProducerSuccess);

    await monitoring.pushMetrics();

    await mongoose.disconnect();
  }
}
