import { SQS } from 'aws-sdk';

const args = process.argv.slice(2);
const sqsClient = new SQS();

const fromQueue = args[0];
const toQueue = args[1];

async function redrive() {
  while (true) {
    const fromMessage = await sqsClient
      .receiveMessage({
        QueueUrl: fromQueue,
        AttributeNames: ['All'],
        MaxNumberOfMessages: 1,
      })
      .promise();

    if (!fromMessage.Messages || !fromMessage.Messages.length) {
      console.log('Finished processing DLQ');
      break;
    }

    const srcMessage = fromMessage.Messages[0];

    const receipt = await sqsClient
      .sendMessage({
        QueueUrl: toQueue,
        MessageBody: srcMessage.Body!,
        MessageGroupId: srcMessage.Attributes!.MessageGroupId,
        MessageDeduplicationId: srcMessage.Attributes!.MessageDeduplicationId,
      })
      .promise();

    if (receipt.MessageId) {
      await sqsClient
        .deleteMessage({
          QueueUrl: fromQueue,
          ReceiptHandle: srcMessage.ReceiptHandle!,
        })
        .promise();
      console.log(
        `Message with body: ${srcMessage.Body} and MessageGroupId ${
          srcMessage.Attributes!.MessageGroupId
        } reprocessed`,
      );
    } else {
      throw new Error(
        `No message receipt for source message: ${JSON.stringify(srcMessage)}`,
      );
    }
  }
}

redrive();
