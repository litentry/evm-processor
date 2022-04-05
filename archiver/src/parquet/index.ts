import parquetjs from "parquetjs";
import { transactionSchema, contractSignatureSchema, logSchema } from "./schema";
import 'dotenv/config';
import fs from 'fs';
import { promisify } from "util";
import * as ethers from 'ethers';
import { getTransactionsLogsAndContractsByBlock } from '../get-transactions-logs-and-contracts-by-block';
import path from "path";

const mkdir = promisify(fs.mkdir);

const blockNum = 12000000;
// const blockNums: number[] = [];
// for (let i = blockNum; i < blockNum + 100; i++) {
//   blockNums.push(i);
// }
const blocksPerFile = 50;

const getBlockStart = (blockNum: number) => {
  return blockNum - (blockNum % blocksPerFile);
}

const getParquetPath = (params: {
  type: string;
  blockNum: number;
}) => {
  const blockRangeStart = getBlockStart(blockNum);
  return `./output/${params.type}/blockStart=${blockRangeStart}/data-${blocksPerFile}.parquet`;
}

interface ParquetBlockSet {
  logs: parquetjs.ParquetWriter;
  transactions: parquetjs.ParquetWriter;
  contractSignatures: parquetjs.ParquetWriter;
}

interface OpenFiles {
  [blockNum: number]: ParquetBlockSet
}

const fds: OpenFiles = {};
const ensureOpen = async (blockNum: number) => {
  if (!fds[blockNum]) {

    const [logPath, transPath, contractPath] = [
      getParquetPath({ type: 'logs', blockNum }),
      getParquetPath({ type: 'transactions', blockNum }),
      getParquetPath({ type: 'contractSignatures', blockNum }),
    ];
    for (const f of [logPath, transPath, contractPath]) {
      await mkdir(path.dirname(f), {recursive: true});
    }

    const parquetBlockSet: ParquetBlockSet = {
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
    }
    fds[blockNum] = parquetBlockSet;
  }
  return fds[blockNum];
}

const closeAll = async () => {
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

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_ENDPOINT!
  );

  console.time('block');
  const data = await getTransactionsLogsAndContractsByBlock(provider, blockNum);
  console.timeEnd('block');

  const {logs, contractSignatures, transactions} = await ensureOpen(blockNum);

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
  await closeAll();

})();

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})