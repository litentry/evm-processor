import worker from './handler';

const errorHandler = async (start: number, end: number): Promise<void> => {
  throw new Error('Forced error');
};
const successHandler = async (start: number, end: number): Promise<void> => {
  console.log('DO SOMETHING');
  return;
};

const message = {
  Records: [
    {
      messageId: 'a',
      receiptHandle: 'b',
      body: '{"startBlock":0,"endBlock":9}',
      attributes: {
        ApproximateReceiveCount: '',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: '',
      },
      messageAttributes: {},
      md5OfBody: 'c',
      eventSource: 'sqs',
      eventSourceARN: 'arn::somewhere',
      awsRegion: 'eu-west-1',
    },
  ],
};

const brokenMessage = {
  Records: [
    {
      messageId: 'a',
      receiptHandle: 'b',
      body: 'BROKEN',
      attributes: {
        ApproximateReceiveCount: '',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: '',
      },
      messageAttributes: {},
      md5OfBody: 'c',
      eventSource: 'sqs',
      eventSourceARN: 'arn::somewhere',
      awsRegion: 'eu-west-1',
    },
  ],
};

describe('AWS worker', () => {
  it('Returns failed message IDs when message is unreadable', async () => {
    expect(await worker(brokenMessage, errorHandler)).toStrictEqual({
      batchItemFailures: [{ itemIdentifier: 'a' }],
    });
  });

  it('Returns failed message IDs when process errors', async () => {
    expect(await worker(message, errorHandler)).toStrictEqual({
      batchItemFailures: [{ itemIdentifier: 'a' }],
    });
  });

  it('Returns empty failed message IDs when process succeeds', async () => {
    expect(await worker(message, successHandler)).toStrictEqual({
      batchItemFailures: [],
    });
  });

  it('Returns empty failed message IDs when process succeeds', async () => {
    console.log = jest.fn();

    await worker(message, successHandler);

    expect(console.log).toHaveBeenCalledWith('DO SOMETHING');
  });
});
