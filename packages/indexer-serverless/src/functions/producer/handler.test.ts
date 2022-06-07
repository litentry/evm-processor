const envVarMock = {
  TARGET_TOTAL_QUEUED_BLOCKS: '200',
  BATCH_SIZE: '1'
}

import aws from 'aws-sdk';
import getLatestBlock from '../../util/get-latest-block';
import producer from './handler';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

jest.mock('../../util/get-env-var', () => (key: keyof typeof envVarMock) => {
  return {...process.env, ...envVarMock}[key];
});

jest.mock('../../util/get-latest-block');
(getLatestBlock as jest.Mock).mockReturnValue(() => 20);

jest.mock('./lastQueuedEndblockRepository');
(getLastQueuedEndBlock as jest.Mock).mockResolvedValue(-1);

jest.mock('aws-sdk', () => {
  const SQSMocked = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    getQueueAttributes: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue({
        Attributes: {
          ApproximateNumberOfMessagesNotVisible: 0,
          ApproximateNumberOfMessages: 0,
        },
      }),
    }),
    sendMessageBatch: jest.fn().mockReturnValue({
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
    await producer();

    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledWith(20);
  });

  it('Should not enqueue when latest block is -1', async () => {
    (getLatestBlock as jest.Mock).mockReturnValueOnce(() => -1);

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(0);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(0);
  });

  it('Should not enqueue if queue contains than the target number of blocks', async () => {
    (getLatestBlock as jest.Mock).mockReturnValueOnce(() => 2000);
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '200';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = (sqs.getQueueAttributes().promise as jest.Mock);
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      }
    });

    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(mockGetQueueAttributes).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(0);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(0);
  });

  it('Should enqueue if queue contains less than the target number of blocks', async () => {
    (getLatestBlock as jest.Mock).mockReturnValueOnce(() => 2000);
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '201';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = (sqs.getQueueAttributes().promise as jest.Mock);
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      }
    });

    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(mockGetQueueAttributes).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
  });
});
