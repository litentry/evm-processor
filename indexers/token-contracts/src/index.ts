import 'dotenv/config';
import { process, query } from 'archive-utils';
import dataSource from './data-source';
import handleContractCreation from './handle-contract-creation';

const start = 200000;
const end = 300000;
const batchSize = 500;

async function run() {
  await dataSource.initialize();

  await process.batchBlocks(start, end, batchSize, async (start, end) => {
    console.log(`Processing ${start} to ${end}`);
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
