import axios from 'axios';
import { NativeTokenTransaction } from '../types';
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

export default async function contractTransactions(
  startBlock: number,
  endBlock: number,
  from?: string,
  to?: string,
  properties: (keyof NativeTokenTransaction)[] = defaultProperties
) {
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
        query NativeTokenTransactions($startBlock: Int!, $endBlock: Int!, $from: String, $to: String) {
          nativeTokenTransactions(
            startBlock: $startBlock,
            endBlock: $endBlock,
            from: $from,
            to: $to
          ) {
            ${properties.join(',')}
          }
        }
      `,
    },
  });
  return response.data.data.nativeTokenTransactions as NativeTokenTransaction[];
}
