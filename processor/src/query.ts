import _ from 'lodash';
import { getProcessorPool } from './db';
import { Block, Transaction, Log, Status, TransactionWithLogs } from './types';

export async function queryStartBlock() {
  let startBlock = 0;

  if (process.env.START_BLOCK) {
    startBlock = parseInt(process.env.START_BLOCK);
  }

  const pool = await getProcessorPool();
  const { rows } = await pool.query<Status>(
    `SELECT last_indexed_block FROM status WHERE id = 'fixed'`
  );

  if (!rows[0]) {
    return startBlock;
  }

  return rows[0].last_indexed_block;
}

export async function queryBlocksByNumber(numbers: number[]) {
  const pool = await getProcessorPool();
  const { rows } = await pool.query<Block>(
    `SELECT * FROM blocks WHERE number IN (${numbers.join(',')})`
  );
  return rows;
}

export async function queryTransactionsByBlockDate(date: Date) {
  const pool = await getProcessorPool();
  const { rows } = await pool.query<Transaction>(
    `SELECT * FROM transactions WHERE block_timestamp = '${date.toISOString()}'`
  );
  return rows;
}

export async function queryLogsByBlockDate(date: Date) {
  const pool = await getProcessorPool();
  const { rows } = await pool.query<Log>(
    `SELECT * FROM logs WHERE block_timestamp = '${date.toISOString()}'`
  );
  return rows;
}

export async function queryTransactionsAndLogs({
  startBlock,
  endBlock,
  contract,
  additionalClause,
}: {
  startBlock: number;
  endBlock: number;
  contract?: string;
  additionalClause?: string;
}): Promise<TransactionWithLogs[]> {
  const pool = await getProcessorPool();

  const { rows: blocks } = await pool.query<Block>(
    `SELECT number, timestamp FROM blocks WHERE number >= ${startBlock} AND number < ${endBlock}`
  );
  const blockTimestamps = blocks.map((block) => block.timestamp.toISOString());

  let txQuery = `SELECT * FROM transactions
  WHERE
    block_timestamp IN (${blockTimestamps.join(',')})
  AND
    receipt_status = 1 `;

  if (contract) {
    txQuery += `AND to_address = '${contract}' `;
  }

  if (additionalClause) {
    txQuery += additionalClause;
  }

  txQuery += ` ORDER BY block_number ASC`;

  const { rows: txs } = await pool.query<Transaction>(txQuery);

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
