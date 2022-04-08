import parquetjs from "parquetjs";
import path from "path";
import { contractSignatureSchema, logSchema, transactionSchema, blockSchema } from "./schema";
import { promisify } from "util";
import fs from "fs";

export interface ParquetBlockSet {
  logs: parquetjs.ParquetWriter;
  transactions: parquetjs.ParquetWriter;
  contractSignatures: parquetjs.ParquetWriter;
  blocks: parquetjs.ParquetWriter;
}

export interface OpenFiles {
  [blockNum: number]: ParquetBlockSet
}

export interface ParquetInstance {
  getBlockStart: (n: number) => number,
  getParquetPath: (p: {
    type: string;
    blockNum: number;
  }) => Promise<string>;
  ensureOpen: (n: number) => Promise<ParquetBlockSet>,
  closeAll: () => Promise<void>
}

export function getParquet(blocksPerFile: number): ParquetInstance {

  let fds: OpenFiles = {};
  const mkdir = promisify(fs.mkdir);

  function getBlockStart(blockNum: number) {
    return blockNum - (blockNum % blocksPerFile);
  }

  async function getParquetPath(params: {
    type: string;
    blockNum: number;
  }) {
    const filePath = `./output/blocks-${blocksPerFile}/${params.type.toLowerCase()}/blockstart=${params.blockNum}/data.parquet`;
    await mkdir(path.dirname(filePath), { recursive: true});
    return filePath;
  }

  async function ensureOpen(forBlock: number) {
    const blockNum = getBlockStart(forBlock);
    if (!fds[blockNum]) {
      const [logPath, transPath, contractPath, blockPath] = [
        await getParquetPath({ type: 'logs', blockNum }),
        await getParquetPath({ type: 'transactions', blockNum }),
        await getParquetPath({ type: 'contractSignatures', blockNum }),
        await getParquetPath({ type: 'blocks', blockNum }),
      ];
      for (const f of [logPath, transPath, contractPath]) {
        console.log(`Opening parquet file ${f}`);
        await mkdir(path.dirname(f), { recursive: true });
      }

      fds[blockNum] = {
        logs: await parquetjs.ParquetWriter.openFile(
          logSchema,
          logPath,
        ),
        transactions: await parquetjs.ParquetWriter.openFile(
          transactionSchema,
          transPath,
        ),
        contractSignatures: await parquetjs.ParquetWriter.openFile(
          contractSignatureSchema,
          contractPath,
        ),
        blocks: await parquetjs.ParquetWriter.openFile(
          blockSchema,
          blockPath,
        ),
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
