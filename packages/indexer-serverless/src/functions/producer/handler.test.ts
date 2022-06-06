import aws from 'aws-sdk';
import getLatestBlock from '../../util/get-latest-block';
import producer from './handler';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

let mockLastQueuedEndBlock = -1;
jest.mock('../../util/get-latest-block');
jest.mock('./lastQueuedEndblockRepository');

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

(getLastQueuedEndBlock as jest.Mock).mockImplementation(() => mockLastQueuedEndBlock);
(saveLastQueuedEndBlock as jest.Mock).mockImplementation((l) => mockLastQueuedEndBlock = l);

describe('AWS producer', () => {
  it('Should enqueue some jobs up to chain height', async () => {

    process.env.BATCH_SIZE = '10';
    process.env.MAX_WORKERS = '1';
    mockLastQueuedEndBlock = -1;
    (getLatestBlock as jest.Mock).mockReturnValue(() => 20);

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

  it('should vary MessageGroupId appropriately with workers = 10, batch size = 1', async () => {

    process.env.BATCH_SIZE = '1';
    process.env.MAX_WORKERS = '10';
    mockLastQueuedEndBlock = -1;
    (getLatestBlock as jest.Mock).mockReturnValue(() => 2);

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
          Id: '0',
          MessageBody: '{"startBlock":0,"endBlock":0}',
          MessageGroupId: '0',
        },
        {
          Id: '1',
          MessageBody: '{"startBlock":1,"endBlock":1}',
          MessageGroupId: '1',
        },
        {
          Id: '2',
          MessageBody: '{"startBlock":2,"endBlock":2}',
          MessageGroupId: '2',
        },
      ],
      QueueUrl: undefined,
    });
  });

  it('should vary MessageGroupId appropriately with workers = 10, batch size = 10', async () => {

    process.env.BATCH_SIZE = '10';
    process.env.MAX_WORKERS = '10';
    mockLastQueuedEndBlock = -1;
    (getLatestBlock as jest.Mock).mockReturnValue(() => 40);

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
          MessageGroupId: '1',
        },
        {
          Id: '29',
          MessageBody: '{"startBlock":20,"endBlock":29}',
          MessageGroupId: '2',
        },
        {
          Id: '39',
          MessageBody: '{"startBlock":30,"endBlock":39}',
          MessageGroupId: '3',
        },
        {
          Id: '40',
          MessageBody: '{"startBlock":40,"endBlock":40}',
          MessageGroupId: '0',
        },
      ],
      QueueUrl: undefined,
    });
  });


  it('should vary MessageGroupId appropriately with workers = 100, batch size = 1, height = 299', async () => {

    process.env.BATCH_SIZE = '1';
    process.env.MAX_WORKERS = '100';
    mockLastQueuedEndBlock = -1;
    (getLatestBlock as jest.Mock).mockReturnValue(() => 299);

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');

    await producer();

    expect(getLatestBlock).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(30);

    const allMessageGroupIds = sendMessageBatchSpy.mock.calls.map((call: any[]) => {
      return call[0].Entries!.map((message: any) => {
        return message.MessageGroupId;
      });
    }).flat();
    
    expect(allMessageGroupIds.length).toStrictEqual(300);
    expect(new Set(allMessageGroupIds).size).toStrictEqual(100);
  });


  it('Should save last queued end block', async () => {
    process.env.BATCH_SIZE = '10';
    process.env.MAX_WORKERS = '1';
    mockLastQueuedEndBlock = -1;
    (getLatestBlock as jest.Mock).mockReturnValue(() => 20);

    await producer();

    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledWith(20);
  });

  it('Should not enqueue', async () => {
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
});
