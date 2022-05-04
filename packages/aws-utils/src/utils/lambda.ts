import { SQSEvent } from "aws-lambda";
import { DeleteMessageBatchRequestEntry } from "aws-sdk/clients/sqs";
import { Config, deleteBatchMessages } from "./sqs";

type ProcessorMessage = {
  startBlock: number,
  endBlock: number,
}

export const lambdaHandler = async (event: SQSEvent, config: Config, innerHandler: (startBlock: number, endBlock: number) => Promise<void>) => {
  const successfulMessages: DeleteMessageBatchRequestEntry[] = (await Promise.all(
    event.Records.map(async record => {
      const message = getMessageFromBody(record.body);

      if (!message) {
        return;
      }

      await innerHandler(message.startBlock, message.endBlock);

      return {
        Id: record.messageId,
        ReceiptHandle: record.receiptHandle,
      };
    })
  )).filter(elem => elem !== undefined) as DeleteMessageBatchRequestEntry[];

  await deleteBatchMessages(config, successfulMessages);
}

function getMessageFromBody(body: string): ProcessorMessage | null {
  try {
    const message = JSON.parse(body);

    return {
      startBlock: message.startBlock,
      endBlock: message.endBlock,
    };
  } catch (e) {
    console.error(e);
    console.log("Failed to parse message from queue: ", body);

    return null;
  }
}