import { DeleteMessageBatchCommand, DeleteMessageBatchRequestEntry, SQSClient } from "@aws-sdk/client-sqs";

class SQSInstance {
  private static instance: SQSClient;

  public static getInstance(): SQSClient {
      if (!SQSInstance.instance) {
          SQSInstance.instance = new SQSClient({'region': ''});
      }

      return SQSInstance.instance;
  }
}

export const deleteBatchMessages = (entries: DeleteMessageBatchRequestEntry[]) => {
  const client = SQSInstance.getInstance();

  const command = new DeleteMessageBatchCommand({
    Entries: entries,
    QueueUrl: '',
  });

  client.send(command).then(
    () => {}, // Done
    (e) => {
      console.error(e);
      console.log('Failed to delete batch of messages: ', entries);
    }
  )
}