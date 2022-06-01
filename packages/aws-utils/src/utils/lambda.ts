import { SQSBatchItemFailure, SQSEvent } from 'aws-lambda';

type ProcessorMessage = {
  startBlock: number;
  endBlock: number;
};

export const lambdaHandler = async (
  event: SQSEvent,
  innerHandler: (startBlock: number, endBlock: number) => Promise<void>,
): Promise<SQSBatchItemFailure[]> => {
  const failedMessageIds: SQSBatchItemFailure[] = (
    await Promise.all(
      event.Records.map(async (record) => {
        const message = getMessageFromBody(record.body);

        if (!message) {
          return { itemIdentifier: record.messageId };
        }

        try {
          console.log(`Begin processing batch ${message.startBlock}-${message.endBlock}`);
          await innerHandler(message.startBlock, message.endBlock);
          console.log(`Processed batch ${message.startBlock}-${message.endBlock}`);
        } catch (e) {
          console.error(
            `Failed to process batch ${message.startBlock}-${message.endBlock}`,
            e,
          );
          return { itemIdentifier: record.messageId };
        }
      }),
    )
  ).filter((e) => e !== undefined) as SQSBatchItemFailure[];

  return failedMessageIds;
};

function getMessageFromBody(body: string): ProcessorMessage | null {
  try {
    const message = JSON.parse(body);

    return {
      startBlock: message.startBlock,
      endBlock: message.endBlock,
    };
  } catch (e) {
    console.error(e);
    console.error('Failed to parse message from queue: ', body);

    return null;
  }
}
