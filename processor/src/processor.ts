import { writeFileSync, readFileSync, existsSync } from 'fs';
import { queryTransactionsAndLogs } from './archive-queries';
import { TransactionConfig } from './types';

export async function processor(txConfigs: TransactionConfig[]) {
  const startBlock = getStartBlock();
  const batchSize = parseInt(process.env.BATCH_SIZE || '10');
  const endBlock = parseInt(process.env.END_BLOCK!);

  let currentBlock = startBlock;

  const [tx] = await queryTransactionsAndLogs({
    startBlock: currentBlock,
    endBlock: currentBlock + 1,
    method: '5ae401dc',
    contract: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
  });

  await txConfigs[0].handler(tx);

  // // todo batches
  // while (currentBlock <= endBlock) {
  //   /*
  //   move logic to uniswap:
  //   contract = 'UNISWAP.V3_CONTRACT_ADDRESS'
  //   additionalClause `AND input LIKE '0x5ae401dc%'`
  //   */
  //   const txs = await queryTransactionsAndLogs({
  //     startBlock: currentBlock,
  //     endBlock: currentBlock + batchSize,
  //     method: '5ae401dc',
  //     contract: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
  //   });
  //   console.log(txs);
  //   // todo - handle txs

  //   writeFileSync('last-indexed-block', currentBlock.toString());
  //   currentBlock += batchSize;
  // }
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
