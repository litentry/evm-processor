import axios from 'axios';
import { ContractCreationTransaction } from '../types';
import endpoint from './endpoint';

const defaultProperties: (keyof ContractCreationTransaction)[] = [
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
  'receiptContractAddress',
];

export default async function contractCreationTransactions(
  startBlock: number,
  endBlock: number,
  contractAddress?: string,
  properties: (keyof ContractCreationTransaction)[] = defaultProperties
) {
  const response = await axios({
    url: endpoint,
    method: 'post',
    data: {
      variables: {
        startBlock,
        endBlock,
        contractAddress,
      },
      query: `
        query ContractCreationTransactions($startBlock: Int!, $endBlock: Int!, $contractAddress: String) {
          contractCreationTransactions(
            startBlock: $startBlock,
            endBlock: $endBlock,
            contractAddress: $contractAddress
          ) {
            ${properties.join(',')}
          }
        }
      `,
    },
  });
  return response.data.data
    .contractCreationTransactions as ContractCreationTransaction[];
}
