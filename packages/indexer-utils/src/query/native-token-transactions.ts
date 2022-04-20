import axios from 'axios';
import { NativeTokenTransaction } from '../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof NativeTokenTransaction)[] = [
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
  'to',
];

export default async function nativeTokenTransactions({
  startBlock,
  endBlock,
  from,
  to,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  from?: string;
  to?: string;
  properties: (keyof NativeTokenTransaction)[];
}) {
  try {
    const response = await axios({
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
          from,
          to,
        },
        query: `
        query NativeTokenTransactions(
          $startBlock: Float!,
          $endBlock: Float!,
          $from: String,
          $to: String
        ) {
          nativeTokenTransactions(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
              }
              from: $from,
              to: $to
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data
      .nativeTokenTransactions as NativeTokenTransaction[];
  } catch (e: any) {
    throw new Error(e.message);
  }
}
