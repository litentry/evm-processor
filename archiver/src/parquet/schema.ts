import parquetjs from 'parquetjs';
import { RowInterface } from "parquetjs/lib/row.interface";

enum ParquetTypes {
  INT64 = 'INT64',
  BOOLEAN = 'BOOLEAN',
  UTF8 = 'UTF8',
}

export const contractSignatureSchema = new parquetjs.ParquetSchema({
  blockNumber: { type: ParquetTypes.INT64 },
  blockTimestamp: { type: ParquetTypes.INT64 },
  contractAddress: { type: ParquetTypes.UTF8 },
  signature: { type: ParquetTypes.UTF8 },
});

export const logSchema = new parquetjs.ParquetSchema({
  blockNumber: { type: ParquetTypes.INT64 },
  transactionHash: { type: ParquetTypes.UTF8 },
  address: { type: ParquetTypes.UTF8 },
  topic0: { type: ParquetTypes.UTF8 },
  topic1: { type: ParquetTypes.UTF8, optional: true },
  topic2: { type: ParquetTypes.UTF8, optional: true },
  topic3: { type: ParquetTypes.UTF8, optional: true },
  topic4: { type: ParquetTypes.UTF8, optional: true },
  data: { type: ParquetTypes.UTF8 },
  logIndex: { type: ParquetTypes.INT64 },
});

export const transactionSchema = new parquetjs.ParquetSchema({
  hash: { type: ParquetTypes.UTF8 },
  nonce: { type: ParquetTypes.INT64 },
  blockHash: { type: ParquetTypes.UTF8 },
  blockNumber: { type: ParquetTypes.INT64 },
  blockTimestamp: { type: ParquetTypes.INT64 },
  transactionIndex: { type: ParquetTypes.INT64 },
  from: { type: ParquetTypes.UTF8 },
  to: { type: ParquetTypes.UTF8, optional: true },
  value: { type: ParquetTypes.UTF8 },
  gasPrice: { type: ParquetTypes.UTF8 },
  gas: { type: ParquetTypes.INT64 },
  maxPriorityFeePerGas: { type: ParquetTypes.UTF8, optional: true },
  maxFeePerGas: { type: ParquetTypes.UTF8, optional: true },
  input: { type: ParquetTypes.UTF8 },

  methodId: { type: ParquetTypes.UTF8, optional: true },

  receiptStatus: { type: ParquetTypes.BOOLEAN, optional: true },
  receiptGasUsed: { type: ParquetTypes.INT64, optional: true },
  receiptCumulativeGasUsed: { type: ParquetTypes.INT64, optional: true },
  receiptEffectiveGasPrice: { type: ParquetTypes.INT64, optional: true },
  receiptContractAddress: { type: ParquetTypes.UTF8, optional: true },
});

export const blockSchema = new parquetjs.ParquetSchema({
  number: { type: ParquetTypes.INT64 },
  hash: { type: ParquetTypes.UTF8 },
  parentHash: { type: ParquetTypes.UTF8 },
  nonce: { type: ParquetTypes.UTF8, optional: true },
  sha3Uncles: { type: ParquetTypes.UTF8 },
  transactionRoot: { type: ParquetTypes.UTF8, optional: true },
  stateRoot: { type: ParquetTypes.UTF8 },
  receiptsRoot: { type: ParquetTypes.UTF8, optional: true },
  miner: { type: ParquetTypes.UTF8 },
  extraData: { type: ParquetTypes.UTF8 },
  gasLimit: { type: ParquetTypes.INT64 },
  gasUsed: { type: ParquetTypes.INT64 },
  timestamp: { type: ParquetTypes.INT64 },
  baseFeePerGas: { type: ParquetTypes.INT64, optional: true },
  size: { type: ParquetTypes.INT64 },
  difficulty: { type: ParquetTypes.UTF8 },
  totalDifficulty: { type: ParquetTypes.UTF8 },
  uncles: { type: ParquetTypes.UTF8, optional: true },
});

export function convert(row: RowInterface, schema: parquetjs.ParquetSchema) {
  const converters: {[k: string]: (value: any) => any} = {
    [ParquetTypes.INT64]: (value: number | BigInt) => value.toString()
  }

  const convertedRow = Object.entries(row).reduce((newRow, [key, value]) => {
    let newValue = value;
    const field = schema.fields[key];
    if (field) {
      const converter = converters[field.primitiveType || ""];
      if (converter) {
        newValue = converter(value);
      }
    }
    return {
      ...newRow,
      [key]: newValue
    }
  }, row);
  return convertedRow;
}