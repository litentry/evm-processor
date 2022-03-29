import { writeFileSync, readFileSync, existsSync } from 'fs';
// import { DataSource as DS } from 'typeorm';
import { queryTransactionsAndLogs } from './archive-queries';
import { TransactionConfig } from './types';

// const DataSource = new DS({
//   type: 'postgres',
//   host: process.env.PROCESSOR_DB_HOST,
//   port: parseInt(process.env.PROCESSOR_DB_PORT!),
//   username: process.env.PROCESSOR_DB_USER,
//   password: process.env.PROCESSOR_DB_PASSWORD,
//   database: process.env.PROCESSOR_DB_DATABASE,
//   // migrations: [],
// });

export async function processor(txConfigs: TransactionConfig[]) {
  // await DataSource.initialize();

  const startBlock = getStartBlock();
  const batchSize = parseInt(process.env.BATCH_SIZE || '10');
  const endBlock = parseInt(process.env.END_BLOCK!);

  let currentBlock = startBlock;

  // todo batches
  while (currentBlock <= endBlock) {
    /*
    move logic to uniswap:
    contract = 'UNISWAP.V3_CONTRACT_ADDRESS'
    additionalClause `AND input LIKE '0x5ae401dc%'`
    */
    const txs = await queryTransactionsAndLogs({
      startBlock: currentBlock,
      endBlock: currentBlock + batchSize,
      method: '5ae401dc',
      contract: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    });
    console.log(txs);
    // todo - handle txs

    writeFileSync('last-indexed-block', currentBlock.toString());
    currentBlock += batchSize;
  }
}

function getStartBlock() {
  let startBlock = 0;

  if (existsSync('last-indexed-block')) {
    const file = readFileSync('last-indexed-block');
    startBlock = parseInt(file.toString());
    return startBlock + 1;
  }

  if (process.env.START_BLOCK) {
    startBlock = parseInt(process.env.START_BLOCK);
  }

  return startBlock;
}
