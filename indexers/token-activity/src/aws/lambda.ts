import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import handler from '../handler';

type ProcessorMessage = {
  startBlock: number,
  endBlock: number,
}

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  const records: SQSRecord[] = event.Records;

  records.forEach(record => {
    const message = getMessageFromBody(record.body);

    if (!message) {
      // TODO: maybe log it?
      return;
    }

    handler(message.startBlock, message.endBlock);
  });
}

function getMessageFromBody(body: string): ProcessorMessage | null {
  try {
    const message = JSON.parse(body);

    return {
      startBlock: message.startBlock,
      endBlock: message.endBlock,
    };
  } catch {
    return null;
  }
}
