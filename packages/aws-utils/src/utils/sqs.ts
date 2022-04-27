import { DeleteMessageBatchCommand, DeleteMessageBatchRequestEntry, SQSClient } from "@aws-sdk/client-sqs";

export type Config = {
  region: string,
  queueUrl: string
}

class SQSInstance {
  private static instance: SQSClient;

  public static getInstance(config: Config): SQSClient {
      if (!SQSInstance.instance) {
          SQSInstance.instance = new SQSClient(config);
      }

      return SQSInstance.instance;
  }
}

export const deleteBatchMessages = async (config: Config, entries: DeleteMessageBatchRequestEntry[]) => {
  const client = SQSInstance.getInstance(config);

  const command = new DeleteMessageBatchCommand({
    Entries: entries,
    QueueUrl: config.queueUrl,
  });

  client.send(command).then(
    () => {}, // Done
    (e) => {
      console.error(e);
      console.log('Failed to delete batch of messages: ', entries);
    }
  )
}