import { DeleteMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { Config, deleteBatchMessages } from './sqs';

type ProcessorMessage = {
  startBlock: number,
  endBlock: number,
}

export const lambdaHandler = async (event: SQSEvent, config: Config, innerHandler: (startBlock: number, endBlock: number) => {}) => {
  const records: SQSRecord[] = event.Records;

  let successfulMessages: DeleteMessageBatchRequestEntry[] = [];

  records.forEach(record => {
    const message = getMessageFromBody(record.body);

    if (!message) {
      // TODO: maybe log it?
      return;
    }

    innerHandler(message.startBlock, message.endBlock);

    successfulMessages .push({
      Id: record.messageId,
      ReceiptHandle: record.receiptHandle,
    });
  });

  deleteBatchMessages(config, successfulMessages);
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
    console.log('Failed to parse message from queue: ', body);

    return null;
  }
}