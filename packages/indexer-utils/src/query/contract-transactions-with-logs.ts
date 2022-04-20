import axios from 'axios';
import {
  ContractTransactionWithLogs,
  ContractTransaction,
  Log,
} from '../types/archive';
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

export default async function contractTransactionsWithLogs({
  startBlock,
  endBlock,
  contractAddress,
  methodId,
  transactionProperties = defaultTxProperties,
  logProperties = defaultLogProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string;
  methodId?: string;
  transactionProperties?: (keyof ContractTransaction)[];
  logProperties?: (keyof Log)[];
}) {
  try {
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
        query ContractTransactionWithLogs(
          $startBlock: Float!,
          $endBlock: Float!,
          $contractAddress: String,
          $methodId: String
        ) {
          contractTransactions(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
              }
              to: $contractAddress,
              methodId: $methodId
            }
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
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
