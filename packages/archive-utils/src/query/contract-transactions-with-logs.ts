import axios from 'axios';
import {
  ContractTransactionWithLogs,
  ContractTransaction,
  Log,
} from '../types';
import endpoint from './endpoint';

const defaultLogProperties: (keyof Log)[] = [
  'blockNumber',
  'blockTimestamp',
  'transactionHash',
  'address',
  'topic0',
  'topic1',
  'topic2',
  'topic3',
  'topic4',
  'data',
  'logIndex',
];

const defaultTxProperties: (keyof ContractTransaction)[] = [
  'hash',
  'nonce',
  'blockHash',
  'blockNumber',
  'blockTimestamp',
  'transactionIndex',
  'from',
  'value',
  'gasPrice',
  'gas',
  'receiptStatus',
  'receiptCumulativeGasUsed',
  'receiptGasUsed',
  'input',
  'methodId',
  'to',
];

export default async function contractTransactionsWithLogs(
  startBlock: number,
  endBlock: number,
  contractAddress?: string,
  methodId?: string,
  transactionProperties: (keyof ContractTransaction)[] = defaultTxProperties,
  logProperties: (keyof Log)[] = defaultLogProperties
) {
  const response = await axios({
    url: endpoint,
    method: 'post',
    data: {
      variables: {
        startBlock,
        endBlock,
        contractAddress,
        methodId,
      },
      query: `
        query ContractTransactionWithLogss($startBlock: Int!, $endBlock: Int!, $contractAddress: String, $methodId: String) {
          contractTransactionsWithLogs(
            startBlock: $startBlock,
            endBlock: $endBlock,
            contractAddress: $contractAddress,
            methodId: $methodId
          ) {
            ${transactionProperties.join(',')}
            logs {
              ${logProperties.join(',')}
            }
          }
        }
      `,
    },
  });
  return response.data.data
    .contractTransactionsWithLogs as ContractTransactionWithLogs[];
}
