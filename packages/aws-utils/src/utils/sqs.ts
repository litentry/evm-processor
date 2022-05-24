import { SQS } from 'aws-sdk';
import { DeleteMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';

export type Config = {
  queueUrl: string;
};

export const deleteBatchMessages = async (
  config: Config,
  entries: DeleteMessageBatchRequestEntry[],
) => {
  const client = new SQS();

  try {
    await client
      .deleteMessageBatch({
        Entries: entries,
        QueueUrl: config.queueUrl,
      })
      .promise();
  } catch (e) {
    console.error(e);
    console.log('Failed to delete batch of messages: ', entries);
  }
};
