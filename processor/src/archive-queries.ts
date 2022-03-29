import _ from 'lodash';
import { Pool } from 'pg';
import { Block, Transaction, Log, TransactionWithLogs } from './types';

const pool = new Pool({
  host: process.env.ARCHIVE_DB_HOST,
  user: 'postgres',
  password: 'postgres',
  database: process.env.ARCHIVE_DB_DATABASE,
  port: parseInt(process.env.ARCHIVE_DB_PORT!),
});

export async function queryTransactionsAndLogs({
  startBlock,
  endBlock,
  contract,
  method,
}: {
  startBlock: number;
  endBlock: number;
  contract: string;
  method: string;
}): Promise<TransactionWithLogs[]> {
  const { rows: blocks } = await pool.query<Block>(
    `SELECT timestamp FROM blocks WHERE number >= ${startBlock} AND number < ${endBlock}`
  );

  const blockTimestamps = blocks
    .map((block) => `'${block.timestamp.toISOString()}'`)
    .join(',');

  const { rows: txs } =
    await pool.query<Transaction>(`SELECT * FROM transactions
  WHERE
    block_timestamp IN (${blockTimestamps})
  AND
    receipt_status = 1
  AND
    to_address = '${contract}'
  AND
    input LIKE '0x${method}%'
  ORDER BY block_number ASC`);

  const { rows: logs } = await pool.query<Log>(
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
