import aws from 'aws-sdk';
import getLatestBlock from '../../util/get-latest-block';
import producer from './handler';
import { saveLastQueuedEndBlock } from './lastQueuedEndblockRepository';

jest.mock('../../util/get-latest-block', () => {
  return jest.fn(() => ({
    __esModule: true,
    default: jest.fn(),
  }));
});

jest.mock('./lastQueuedEndblockRepository', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    saveLastQueuedEndBlock: jest.fn(),
    getLastQueuedEndBlock: () => -1,
  };
});

jest.mock('aws-sdk', () => {
  const SQSMocked = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    getQueueAttributes: () => ({
      promise: () => ({
        Attributes: {
          ApproximateNumberOfMessagesNotVisible: 0,
          ApproximateNumberOfMessages: 0,
        },
      }),
    }),
    sendMessageBatch: () => ({
      promise: jest.fn(),
    }),
  };
  return {
    SQS: jest.fn(() => SQSMocked),
  };
});

describe('AWS producer', () => {
  it('Should enqueue some jobs up to chain height', async () => {
    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    const mockedGetLatestBlock = jest.mocked(getLatestBlock, true);
    mockedGetLatestBlock.mockReturnValue(async () => 20);

    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledWith({
      Entries: [
        {
          Id: '9',
          MessageBody: '{"startBlock":0,"endBlock":9}',
          MessageGroupId: '0',
        },
        {
          Id: '19',
          MessageBody: '{"startBlock":10,"endBlock":19}',
          MessageGroupId: '0',
        },
        {
          Id: '20',
          MessageBody: '{"startBlock":20,"endBlock":20}',
          MessageGroupId: '0',
        },
      ],
      QueueUrl: undefined,
    });
  });

  it('Should save last queued end block', async () => {
    const mockedGetLatestBlock = jest.mocked(getLatestBlock, true);
    mockedGetLatestBlock.mockReturnValue(async () => 20);
    await producer();

    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledWith(20);
  });

  it('Should not enqueue', async () => {
    const mockedGetLatestBlock = jest.mocked(getLatestBlock, true);
    mockedGetLatestBlock.mockReturnValue(async () => -1);
    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(0);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(0);
  });
});
