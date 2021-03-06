const envVarMock = {
  TARGET_TOTAL_QUEUED_BLOCKS: '200',
  BATCH_SIZE: '10',
  MAX_WORKERS: '1',
};

import aws from 'aws-sdk';
import { metrics, monitoring } from 'indexer-monitoring';
import producer from './handler';
import {
  getLastQueuedEndBlock,
  saveLastQueuedEndBlock,
} from './lastQueuedEndblockRepository';

let mockLastQueuedEndBlock = -1;
jest.mock('../../util/get-env-var', () => (key: keyof typeof envVarMock) => {
  return { ...process.env, ...envVarMock }[key];
});

jest.mock('./lastQueuedEndblockRepository');

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

(getLastQueuedEndBlock as jest.Mock).mockImplementation(
  () => mockLastQueuedEndBlock,
);
(saveLastQueuedEndBlock as jest.Mock).mockImplementation(
  (l) => (mockLastQueuedEndBlock = l),
);

const getLatestBlock = {
  fn: (number: number) => async () => number,
};

jest.spyOn(getLatestBlock, 'fn');

describe('AWS producer', () => {
  it('Should enqueue some jobs up to chain height', async () => {
    envVarMock.BATCH_SIZE = '10';
    envVarMock.MAX_WORKERS = '1';
    mockLastQueuedEndBlock = -1;

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');

    await producer({}, getLatestBlock.fn(20));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(2);
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
    envVarMock.BATCH_SIZE = '1';
    envVarMock.MAX_WORKERS = '10';
    mockLastQueuedEndBlock = -1;

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');

    await producer({}, getLatestBlock.fn(2));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(2);
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
    envVarMock.BATCH_SIZE = '10';
    envVarMock.MAX_WORKERS = '10';
    mockLastQueuedEndBlock = -1;

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');

    await producer({}, getLatestBlock.fn(40));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(2);
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

  it('should vary MessageGroupId appropriately with workers = 100, batch size = 1, height = 199', async () => {
    envVarMock.BATCH_SIZE = '1';
    envVarMock.MAX_WORKERS = '100';
    mockLastQueuedEndBlock = -1;

    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');

    await producer({}, getLatestBlock.fn(199));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(2);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(20);

    const allMessageGroupIds = sendMessageBatchSpy.mock.calls
      .map((call: any[]) => {
        return call[0].Entries!.map((message: any) => {
          return message.MessageGroupId;
        });
      })
      .flat();

    expect(allMessageGroupIds.length).toStrictEqual(200);
    expect(new Set(allMessageGroupIds).size).toStrictEqual(100);
  });

  it('Should save last queued end block', async () => {
    envVarMock.BATCH_SIZE = '10';
    envVarMock.MAX_WORKERS = '1';
    mockLastQueuedEndBlock = -1;

    await producer({}, getLatestBlock.fn(20));

    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledWith(20);
  });

  it('Should not enqueue when latest block is -1', async () => {
    const sqs = new aws.SQS();
    const getQueueAttributesSpy = jest.spyOn(sqs, 'getQueueAttributes');
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer({}, getLatestBlock.fn(-1));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(getQueueAttributesSpy).toHaveBeenCalledTimes(2);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(0);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(0);
  });

  it('Should not enqueue if queue contains than the target number of blocks', async () => {
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '200';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = sqs.getQueueAttributes()
      .promise as jest.Mock;
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      },
    });

    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer({}, getLatestBlock.fn(2000));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(mockGetQueueAttributes).toHaveBeenCalledTimes(2);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(0);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(0);
  });

  it('Should enqueue if queue contains less than the target number of blocks', async () => {
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '201';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = sqs.getQueueAttributes()
      .promise as jest.Mock;
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      },
    });

    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    await producer({}, getLatestBlock.fn(2000));

    expect(getLatestBlock.fn).toHaveBeenCalledTimes(1);
    expect(mockGetQueueAttributes).toHaveBeenCalledTimes(2);
    expect(sendMessageBatchSpy).toHaveBeenCalledTimes(1);
    expect(saveLastQueuedEndBlock).toHaveBeenCalledTimes(1);
  });

  it('Should track metrics on success', async () => {
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '201';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = sqs.getQueueAttributes()
      .promise as jest.Mock;
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      },
    });

    await producer({}, getLatestBlock.fn(2000));

    expect(monitoring.markEndAndMeasure).toBeCalledTimes(1);
    expect(monitoring.markEndAndMeasure).lastCalledWith(
      metrics.lambdaProducerSuccess,
    );
    expect(monitoring.gauge).toBeCalledTimes(5);
    expect(monitoring.gauge).toHaveBeenNthCalledWith(
      1,
      2000,
      metrics.lastChainBlock,
    );
    expect(monitoring.gauge).toHaveBeenNthCalledWith(
      2,
      1,
      metrics.lambdaWorkerMaxWorkers,
    );
    expect(monitoring.gauge).toHaveBeenNthCalledWith(
      3,
      1,
      metrics.lambdaProducerBatchSize,
    );
    expect(monitoring.gauge).toHaveBeenNthCalledWith(
      4,
      199,
      metrics.sqsMessageCount,
    );
    expect(monitoring.gauge).toHaveBeenNthCalledWith(
      5,
      199,
      metrics.sqsDlqMessageCount,
    );
  });

  it('Should track metrics on error', async () => {
    envVarMock['TARGET_TOTAL_QUEUED_BLOCKS'] = '201';
    envVarMock['BATCH_SIZE'] = '1';

    const sqs = new aws.SQS();
    const mockGetQueueAttributes = sqs.getQueueAttributes()
      .promise as jest.Mock;
    mockGetQueueAttributes.mockReturnValue({
      Attributes: {
        ApproximateNumberOfMessagesNotVisible: 1,
        ApproximateNumberOfMessages: 199,
      },
    });

    const mockLatestBlock = (number: number) => async () => {
      if (number === 1) {
        throw new Error('e');
      }

      return 0;
    };

    await expect(producer({}, mockLatestBlock(1))).rejects.toThrow('e');

    expect(monitoring.markEndAndMeasure).toBeCalledTimes(0);

    expect(monitoring.incCounter).toBeCalledTimes(1);
    expect(monitoring.incCounter).lastCalledWith(
      1,
      metrics.lambdaProducerFailure,
    );
  });

  it('Should create batches appropriately for an explicit payload', async () => {
    const sqs = new aws.SQS();
    const sendMessageBatchSpy = jest.spyOn(sqs, 'sendMessageBatch');
    envVarMock.MAX_WORKERS = '10';

    await producer(
      {
        start: 0,
        end: 39,
        batchSize: 10,
      },
      getLatestBlock.fn(100),
    );

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
      ],
      QueueUrl: undefined,
    });
    expect(saveLastQueuedEndBlock).not.toHaveBeenCalled();
  });
});
