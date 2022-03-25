import db from './db';
import { Block, Transaction, Log } from './types';

export async function queryBlocksByNumber(numbers: number[]) {
  const { rows } = await db.query<Block>(
    `SELECT * FROM blocks WHERE number IN (${numbers.join(',')})`
  );
  return rows;
}

export async function queryTransactionsByBlockDate(date: Date) {
  const { rows } = await db.query<Transaction>(
    `SELECT * FROM transactions WHERE block_timestamp = '${date.toISOString()}'`
  );
  return rows;
}

export async function queryLogsByBlockDate(date: Date) {
  const { rows } = await db.query<Log>(
    `SELECT * FROM logs WHERE block_timestamp = '${date.toISOString()}'`
  );
  return rows;
}
