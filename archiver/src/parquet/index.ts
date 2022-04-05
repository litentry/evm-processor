import parquetjs from "parquetjs";
import { contractSignatureSchema, logSchema, transactionSchema } from "./schema";
import 'dotenv/config';
import fs from 'fs';
import { promisify } from "util";
import * as ethers from 'ethers';
import { getTransactionsLogsAndContractsByBlock } from '../get-transactions-logs-and-contracts-by-block';
import path from "path";
import { ContractSignatures, Log, Transaction } from "../types";

interface ParquetBlockSet {
  logs: parquetjs.ParquetWriter;
  transactions: parquetjs.ParquetWriter;
  contractSignatures: parquetjs.ParquetWriter;
}

interface OpenFiles {
  [blockNum: number]: ParquetBlockSet
}

function getBlockStart(blockNum: number) {
  return blockNum - (blockNum % blocksPerFile);
}

function getParquetPath(params: {
  type: string;
  blockNum: number;
}) {
  return `./output/${params.type}/blockStart=${params.blockNum}/data-${blocksPerFile}.parquet`;
}

async function ensureOpen(forBlock: number) {
  const blockNum = getBlockStart(forBlock);
  if (!fds[blockNum]) {
    const [logPath, transPath, contractPath] = [
      getParquetPath({ type: 'logs', blockNum }),
      getParquetPath({ type: 'transactions', blockNum }),
      getParquetPath({ type: 'contractSignatures', blockNum }),
    ];
    for (const f of [logPath, transPath, contractPath]) {
      console.log(`Opening parquet file ${f}`);
      await mkdir(path.dirname(f), { recursive: true });
    }

    fds[blockNum] = {
      logs: await parquetjs.ParquetWriter.openFile(
        logSchema,
        logPath,
        {}
      ),
      transactions: await parquetjs.ParquetWriter.openFile(
        transactionSchema,
        transPath,
        {}
      ),
      contractSignatures: await parquetjs.ParquetWriter.openFile(
        contractSignatureSchema,
        contractPath,
        {}
      )
    };
  }
  return fds[blockNum];
}

async function closeAll() {
  const allWriters: parquetjs.ParquetWriter[] = Object.values(fds).reduce((allWriters, writers) => {
    return [
      ...allWriters,
      Object.values(writers)
    ]
  }, [] as parquetjs.ParquetWriter[]).flat();

  return Promise.all(allWriters.map((writer) => {
    if (writer.rowBuffer.rowCount) {
      return writer.close();
    }
    return Promise.resolve();
  }));
}

const fds: OpenFiles = {};
const mkdir = promisify(fs.mkdir);
const blockNum = 14000000;
const blockNums: number[] = [];
const blocksPerFile = 5;

for (let i = blockNum; i < blockNum + 100; i++) {
  blockNums.push(i);
}

async function ensureGetTransactionsLogsAndContractsByBlock(provider: any, num: number): Promise<{
  transactions: Transaction[]; logs: Log[]; contractSignatures: ContractSignatures[]
}> {
  const attempts = 5;
  for (let i = 0; i < attempts; i++) {
    try {
      return await getTransactionsLogsAndContractsByBlock(provider, num);
    } catch (e: any) {
      console.log(`Caught ${e.message} -  retrying...`);
    }
  }
  throw new Error(`Failed to receive data after ${attempts} attempts`)
}

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_ENDPOINT!
  );

  for (const num of blockNums) {
    console.log(`BlockNum: ${num}`);
    console.time('block');

    const data = await ensureGetTransactionsLogsAndContractsByBlock(provider, num);
    console.timeEnd('block');

    const { logs, contractSignatures, transactions } = await ensureOpen(num);

    await Promise.all(data.logs.map((r) => logs.appendRow(r)));
    await Promise.all(data.contractSignatures.map((r) => contractSignatures.appendRow(r)));
    await Promise.all(data.transactions.map((r) => {
      const s = {
        ...r,
        value: r.value.toString(),
        gasUsed: r.gasUsed.toString(),
        cumulativeGasUsed: r.cumulativeGasUsed.toString(),
        effectiveGasPrice: r.effectiveGasPrice.toString(),
      }
      return transactions.appendRow(s);
    }));
  }
  await closeAll();
})();

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})