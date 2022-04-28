import config from "@app/config";

const { SQS } = require("aws-sdk");

const sqs = new SQS();
const maxMessagesToQueuePerExecution = 100;

let lastQueuedEndBlock = 0;

interface BatchSQSMessage {
    Id: string,
    MessageBody: string
}

export default async (_: any) => {

    if (lastQueuedEndBlock < 1) {
        //@todo then try to fetch it from mongo
    }

    const targetBlockHeight = typeof config.end == "number" ? config.end : await config.end();

    if (targetBlockHeight <= lastQueuedEndBlock) {
        console.log(`Last queued message is up to the target block height`);
        return;
    }

    const targetJobCount = Math.min(maxMessagesToQueuePerExecution, targetBlockHeight - lastQueuedEndBlock);
    const targetLastQueuedEndBlock = lastQueuedEndBlock + targetJobCount;

    const dispatch = async (jobs: BatchSQSMessage[]) => {
        await sqs
            .sendMessageBatch({
                QueueUrl: process.env.QUEUE_URL,
                Entries: jobs
            })
            .promise();

        lastQueuedEndBlock = Number(jobs[jobs.length - 1].Id);

        //@todo flush lastQueuedEndBlock to mongo
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

    console.log(`Queued ${targetJobCount} jobs. Last job end block: ${targetLastQueuedEndBlock}`);
};

