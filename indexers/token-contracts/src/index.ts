import 'dotenv/config';
import { processor, query } from 'archive-utils';
import dataSource from './data-source';
import handleContractCreation from './handle-contract-creation';

const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK ? parseInt(process.env.END_BLOCK) : null;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 500;

async function run() {
  await dataSource.initialize();

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
}

run();
