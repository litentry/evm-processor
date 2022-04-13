import parquetjs, { ParquetSchema } from "parquetjs";
import path from "path";
import schemas, {
  blocks,
  contractCreationTransactions,
  contractSignatures,
  contractTransactions,
  logs,
  nativeTokenTransactions
} from "./schema";
import { mkdir } from "fs/promises";
import { convert } from "./convert-to-schema";

interface ParquetBlockSet {
  blocks: ParquetWriter;
  contractSignatures: ParquetWriter;
  logs: ParquetWriter;
  nativeTokenTransactions: ParquetWriter;
  contractTransactions: ParquetWriter;
  contractCreationTransactions: ParquetWriter;
}

type Rows = {
  [type in keyof ParquetBlockSet]: {
    [startBlock: number]: any[];
  };
};

type Closing = {
  [type in keyof ParquetBlockSet]: {
    [startBlock: number]: boolean;
  };
};

interface ParquetWriter {
  path: string;
  rows: any[];
  writer: parquetjs.ParquetWriter;
}

export interface ParquetInstance {
  writeRemainingBuffer: () => Promise<any>,
  appendRow: (rowData: any, blockNumber: number, type: keyof ParquetBlockSet) => void
}

export function getParquet(blocksPerFile: number): ParquetInstance {
  const writers = Promise.resolve();

  const closing: Closing = Object.keys(schemas).reduce((existing, key) => {
    return {
      ...existing,
      [key]: []
    };
  }, {} as { [type in keyof ParquetBlockSet]: any });

  const bufferedRowSets: Rows = Object.keys(schemas).reduce((existing, key) => {
    return {
      ...existing,
      [key]: []
    };
  }, {} as { [type in keyof ParquetBlockSet]: any });

  const schemaMap: { [k: string]: ParquetSchema } = Object
    .entries(schemas)
    .reduce((currentSchemas, [key, schema]) => {
      return {
        ...currentSchemas,
        [key]: new ParquetSchema(schema)
      }
    }, {});

  /**
   * Main synchronous data buffering function. Calls write when a new block range has been entered but doesn't care
   * about the result - this needs to be taken care of by closeAll.
   * @param rowData
   * @param blockNumber
   * @param type
   */
  function appendRow(rowData: any, blockNumber: number, type: keyof ParquetBlockSet) {
    const currentStartBlock = getBlockStart(blockNumber);
    const previousStartBlock = currentStartBlock - blocksPerFile;

    if (!bufferedRowSets[type][currentStartBlock]) {
      bufferedRowSets[type][currentStartBlock] = [];
    }
    bufferedRowSets[type][currentStartBlock].push(
      convert(rowData, schemaMap[type])
    );
    if (bufferedRowSets[type][previousStartBlock]) {
      writers.then(() => write(previousStartBlock, type));
    }
  }

  /**
   * Writes data to a Parquet file designated by its block number and type
   * @param startBlock
   * @param type
   */
  async function write(startBlock: number, type: keyof ParquetBlockSet) {
    if (closing[type][startBlock]) {
      return;
    }
    closing[type][startBlock] = true;
    const rowData = bufferedRowSets[type][startBlock];
    if (rowData) {
      const filePath = await getParquetPath({ type, blockNum: startBlock });
      console.log(`Opening parquet file ${filePath}`);

      await mkdir(path.dirname(filePath), { recursive: true });
      const parquetFile = await parquetjs.ParquetWriter.openFile(schemaMap[type], filePath);

      for (const row of rowData) {
        await parquetFile.appendRow(row);
      }
      await parquetFile.close();
      delete bufferedRowSets[type][startBlock];
    }
  }

  function getBlockStart(blockNum: number) {
    return blockNum - (blockNum % blocksPerFile);
  }

  async function getParquetPath(params: {
    type: string;
    blockNum: number;
  }) {
    const filePath = `./output/blocks-${blocksPerFile}/${params.type.toLowerCase()}/blockstart=${params.blockNum}/data.parquet`;
    await mkdir(path.dirname(filePath), { recursive: true });
    return filePath;
  }

  async function writeRemainingBuffer() {
    return Promise.all(
      Object
        .entries(bufferedRowSets)
        .map(([type, rowSet]) =>
          Object
            .keys(rowSet)
            .map((key) => write(
              parseInt(key),
              <keyof ParquetBlockSet>type
            )
          )
        )
        .flat()
    );
  }

  return { writeRemainingBuffer, appendRow };
}
