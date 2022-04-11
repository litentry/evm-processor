import axios from 'axios';
import { ContractTransaction } from '../types';
import endpoint from './endpoint';

const defaultProperties: (keyof ContractTransaction)[] = [
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

export default async function contractTransactions(
  startBlock: number,
  endBlock: number,
  contractAddress?: string,
  methodId?: string,
  properties: (keyof ContractTransaction)[] = defaultProperties
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
        query ContractTransactions($startBlock: Int!, $endBlock: Int!, $contractAddress: String, $methodId: String) {
          contractTransactions(
            startBlock: $startBlock,
            endBlock: $endBlock,
            contractAddress: $contractAddress,
            methodId: $methodId
          ) {
            ${properties.join(',')}
          }
        }
      `,
    },
  });
  return response.data.data.contractTransactions as ContractTransaction[];
}
