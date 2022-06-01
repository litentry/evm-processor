import { connect, disconnect } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connect(mongoServer.getUri(), {
    dbName: 'test',
  });
});

afterAll(async () => {
  await disconnect();
  await mongoServer?.stop();
});
