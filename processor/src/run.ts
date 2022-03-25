import {
  queryBlocksByNumber,
  queryTransactionsByBlockDate,
  queryLogsByBlockDate,
} from './query';
import fs from 'fs';

const START_BLOCK_NUMBER = 14389625;

export default async function run() {
  // console.time('by number');
  // let currentBlock = START_BLOCK_NUMBER;
  // for (let i = 0; i < 44; i++) {
  //   const block = await queryBlockByNumber(currentBlock + i);
  // }
  // console.timeEnd('by number');
  const [block] = await queryBlocksByNumber([START_BLOCK_NUMBER]);
  const transactions = await queryTransactionsByBlockDate(block.timestamp);
  const logs = await queryLogsByBlockDate(block.timestamp);

  const uniswapTx = transactions.find(
    (tx) =>
      tx.hash ===
      '0xa16803e1519af885e1da4d72f3ee5c7cd4596903eb24d4eec4ce4c0cf5692b4a'
  );
  console.log(uniswapTx);
  const uniswapTxLogs = logs.filter(
    (log) =>
      log.transaction_hash ===
      '0xa16803e1519af885e1da4d72f3ee5c7cd4596903eb24d4eec4ce4c0cf5692b4a'
  );
  console.log(uniswapTxLogs);
  fs.writeFileSync(
    './uniswap.json',
    JSON.stringify(
      {
        transaction: uniswapTx,
        logs: uniswapTxLogs,
      },
      null,
      2
    )
  );
}
// 0x0000000000000000000000000000000000000000000000001257178ba5efbf40
// c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
// 4eda45b949e3166c0000
