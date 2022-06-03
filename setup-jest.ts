import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from 'mongoose';

let mongoServer: MongoMemoryServer;

jest.mock('indexer-monitoring', () => {
  const originalModule = jest.requireActual('indexer-monitoring');

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    monitoring: {
      pushMetrics: () => {},
    },
  };
});

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

beforeAll(async () => {
  process.env.PUSHGATEWAY_URL = 'test';

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
