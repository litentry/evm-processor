import _ from 'lodash';
import pg, { Pool, QueryResult, QueryResultRow } from 'pg';
import { Transaction, Log, TransactionWithLogs } from './types';

pg.types.setTypeParser(20, BigInt);
pg.types.setTypeParser(1700, BigInt);

const pool = new Pool({
  host: process.env.ARCHIVE_DB_HOST,
  user: 'postgres',
  password: 'postgres',
  database: process.env.ARCHIVE_DB_DATABASE,
  port: parseInt(process.env.ARCHIVE_DB_PORT!),
});

const query = async <R extends QueryResultRow = any, I extends any[] = any[]>(
  config: any
): Promise<QueryResult<R>> => {
  let result;
  try {
    result = await pool.query(config);
  } catch (e) {
    console.error('Failing query/config:', config);
    throw e;
  }
  return result;
};

export async function queryChainHeight(): Promise<number> {
  const { rows: blocks } = await query<{ height: BigInt }>(
    'SELECT MAX(number) as height FROM blocks'
  );
  return Number(blocks[0].height);
}

export async function queryTransactionsAndLogs({
  startBlock,
  endBlock,
  contract,
  methodId,
}: {
  startBlock: number;
  endBlock: number;
  contract: string;
  methodId: string;
}): Promise<TransactionWithLogs[]> {
  const { rows: blocks } = await query<{
    start: Date;
    end: Date;
  }>(
    `SELECT MIN(timestamp) as start, MAX(timestamp) as end FROM blocks WHERE number >= ${startBlock} AND number <= ${endBlock}`
  );

  const { rows: txs } = await query<Transaction>(
    `SELECT * FROM transactions
    WHERE
      block_timestamp >= '${blocks[0].start.toISOString()}'
    AND
      block_timestamp <= '${blocks[0].end.toISOString()}'
    AND
      receipt_status = 1
    AND
      to_address = '${contract}'
    AND
      input LIKE '0x${methodId}%'
    ORDER BY block_number ASC`
  );

  const txHashes = txs.map((tx) => `'${tx.hash}'`).join(',');

  if (txHashes.length) {
    const { rows: logs } = await query<Log>(
      `SELECT * FROM logs
    WHERE
      block_timestamp >= '${blocks[0].start.toISOString()}'
    AND
      block_timestamp <= '${blocks[0].end.toISOString()}'
    AND
      transaction_hash IN (${txHashes}) ORDER BY log_index ASC`
    );

    const logsByTx = _.groupBy(logs, 'transaction_hash');

    return txs.map((tx) => ({
      ...tx,
      logs: logsByTx[tx.hash],
    }));
  }
  return [];
}
