import _ from 'lodash';
import { Log, Transaction, TransactionWithLogs } from './types';
import db from './db';
import { UNISWAP } from './constants';

export default async function getMulticalls(
  start_block: number,
  end_block: number
): Promise<TransactionWithLogs[]> {
  // 0x5ae401dc = keccak256(multicall(uint256,bytes[]))
  const { rows: txs } = await db.query<Transaction>(
    `SELECT * FROM transactions
    WHERE
      block_number >= ${start_block} AND block_number <= ${end_block}
    AND
      receipt_status = 1
    AND
      to_address = '${UNISWAP.V3_CONTRACT_ADDRESS}'
    AND
      input LIKE '0x5ae401dc%'
    ORDER BY block_number ASC`
  );

  const { rows: logs } = await db.query<Log>(
    `SELECT * FROM logs WHERE transaction_hash IN (${txs
      .map((tx) => `'${tx.hash}'`)
      .join(',')}) ORDER BY log_index ASC`
  );

  const logsByTx = _.groupBy(logs, 'transaction_hash');

  return txs.map((tx) => ({
    ...tx,
    logs: logsByTx[tx.hash],
  }));
}
