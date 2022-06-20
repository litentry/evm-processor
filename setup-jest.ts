import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from 'mongoose';

let mongoServer: MongoMemoryServer;

jest.mock('indexer-monitoring');

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

beforeAll(async () => {
  process.env.BATCH_SIZE = '10';
  process.env.END_BLOCK = 'undefined';
  process.env.PUSHGATEWAY_URL = 'test';
  process.env.SERVICE_NAME = 'test_indexer';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await connect(mongoServer.getUri(), {
    dbName: 'test',
  });
});

afterAll(async () => {
  await disconnect();
  await mongoServer?.stop();
});
