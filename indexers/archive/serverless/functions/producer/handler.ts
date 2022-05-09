import config from "@app/config";
import {SQS} from "aws-sdk";
import {getLastQueuedEndBlock, saveLastQueuedEndBlock} from "./lastQueuedEndblockRepository";
import mongoose from "mongoose";

const sqs = new SQS();
const maxBlocksToQueuePerExecution = 50000;

let lastQueuedEndBlock = 0;

interface BatchSQSMessage {
    Id: string,
    MessageBody: string
}

export default async (_: any) => {

    await mongoose.connect(config.mongoUri);

    if (lastQueuedEndBlock < 1) {
        lastQueuedEndBlock =  await getLastQueuedEndBlock('archive') ?? config.start;
    }

    const targetBlockHeight = typeof config.end == "number" ? config.end : await config.end();

    if (targetBlockHeight <= lastQueuedEndBlock) {
        console.log(`Last queued message is up to the target block height`);
        return;
    }

    const targetJobCount = Math.min(maxBlocksToQueuePerExecution, targetBlockHeight - lastQueuedEndBlock);
    const targetLastQueuedEndBlock = lastQueuedEndBlock + targetJobCount;

    const dispatch = async (jobs: BatchSQSMessage[]) => {
        await sqs
            .sendMessageBatch({
                QueueUrl: process.env.QUEUE_URL,
                Entries: jobs
            })
            .promise();

        lastQueuedEndBlock = Number(jobs[jobs.length - 1].Id);

        await saveLastQueuedEndBlock('archive', lastQueuedEndBlock);
    }

    let pendingJobs = [];
    for (let i = lastQueuedEndBlock; i <= targetLastQueuedEndBlock; i++) {
        const startBlock = i + 1;
        const endBlock = Math.min(i + config.batchSize, targetLastQueuedEndBlock);
        pendingJobs.push({Id: `${endBlock}`,  MessageBody: JSON.stringify({startBlock, endBlock})});
        i = endBlock;

        if (pendingJobs.length === 10 || i === targetLastQueuedEndBlock) {
            await dispatch(pendingJobs);
            pendingJobs = [];
        }
    }

    await mongoose.disconnect();

    console.log(`Queued ${targetJobCount} jobs. Last job end block: ${targetLastQueuedEndBlock}`);
};

