import parquetjs from "parquetjs";
import path from "path";
import { contractSignatureSchema, logSchema, transactionSchema } from "./schema";
import { promisify } from "util";
import fs from "fs";
import throat from "throat";

export interface ParquetBlockSet {
  logs: parquetjs.ParquetWriter;
  transactions: parquetjs.ParquetWriter;
  contractSignatures: parquetjs.ParquetWriter;
}

export interface OpenFiles {
  [blockNum: number]: ParquetBlockSet
}

export interface ParquetInstance {
  getBlockStart: (n: number) => number,
  getParquetPath: (p: {
    type: string;
    blockNum: number;
  }) => string;
  ensureOpen: (n: number) => Promise<ParquetBlockSet>,
  closeAll: () => Promise<void>
}

export function getParquet(blocksPerFile: number): ParquetInstance {

  let fds: OpenFiles = {};
  const mkdir = promisify(fs.mkdir);

  function getBlockStart(blockNum: number) {
    return blockNum - (blockNum % blocksPerFile);
  }

  function getParquetPath(params: {
    type: string;
    blockNum: number;
  }) {
    return `./output/blocks-${blocksPerFile}/${params.type.toLowerCase()}/blockstart=${params.blockNum}/data.parquet`;
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
          logPath
        ),
        transactions: await parquetjs.ParquetWriter.openFile(
          transactionSchema,
          transPath,
        ),
        contractSignatures: await parquetjs.ParquetWriter.openFile(
          contractSignatureSchema,
          contractPath,
        )
      };
    }
    return fds[blockNum];
  }

  async function closeAll() {
    const allWriters: parquetjs.ParquetWriter[] = Object.values(fds)
      .reduce((allWriters, writers) => {
        return [
          ...allWriters,
          Object.values(writers)
        ]
      }, [] as parquetjs.ParquetWriter[]).flat();

    await Promise.all(allWriters.map(async (writer) => {
      if (writer.rowBuffer.rowCount) {
        return writer.close();
      }
      return Promise.resolve();
    }));
    fds = {};

  }
  return { getBlockStart, getParquetPath, ensureOpen, closeAll };
}
