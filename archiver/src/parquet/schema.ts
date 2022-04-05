import parquetjs from 'parquetjs';

export const contractSignatureSchema = new parquetjs.ParquetSchema({
  blockNumber: { type: 'INT64' },
  contractAddress: { type: 'UTF8' },
  signature: { type: 'UTF8' },
});

export const logSchema = new parquetjs.ParquetSchema({
  blockNumber: { type: 'INT64' },
  transactionHash: { type: 'UTF8' },
  address: { type: 'UTF8' },
  topic0: { type: 'UTF8' },
  topic1: { type: 'UTF8', optional: true },
  topic2: { type: 'UTF8', optional: true },
  topic3: { type: 'UTF8', optional: true },
  topic4: { type: 'UTF8', optional: true },
  data: { type: 'UTF8' },
  logIndex: { type: 'INT64' },
});

export const transactionSchema = new parquetjs.ParquetSchema({
  blockNumber: { type: 'INT64' },
  methodId: { type: 'UTF8' },
  to: { type: 'UTF8' },
  hash: { type: 'UTF8' },
  blockHash: { type: 'UTF8' },
  data: { type: 'UTF8' },
  from: { type: 'UTF8' },
  contractCreated: { type: 'UTF8', optional: true },
  accessList: { type: 'UTF8', optional: true },
  nonce: { type: 'INT64' },
  type: { type: 'INT64' },
  transactionIndex: { type: 'INT64' },
  value: { type: 'UTF8' },
  gasUsed: { type: 'UTF8' },
  cumulativeGasUsed: { type: 'UTF8' },
  effectiveGasPrice: { type: 'UTF8' },
});
