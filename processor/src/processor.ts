import { queryStartBlock, queryTransactionsAndLogs } from './query';

export async function processor() {
  const startBlock = await queryStartBlock();
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
    });
    // todo - handle txs

    currentBlock += batchSize;
  }
}
