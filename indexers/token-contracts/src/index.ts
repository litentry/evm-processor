import 'dotenv/config';
import mongoose from 'mongoose';
import schema from './schema';
import { graphqlServer, processor, query } from 'archive-utils';
import handleContractCreation from './handle-contract-creation';

const port = process.env.PORT ? parseInt(process.env.PORT) : 4051;
const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK ? parseInt(process.env.END_BLOCK) : null;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 10000;

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);

  processor(start, query.latestBlock, batchSize, async (start, end) => {
    const txs = await query.contractCreationTransactions(
      start,
      end,
      undefined,
      [
        'receiptContractAddress',
        'from',
        'blockNumber',
        'blockTimestamp',
        'input',
        'receiptStatus',
      ]
    );
    if (txs) await Promise.all(txs.map(handleContractCreation));
  });

  if (!end) {
    graphqlServer(schema, port);
  }
}

run();
