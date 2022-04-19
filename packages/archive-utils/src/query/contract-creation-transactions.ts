import axios from 'axios';
import { ContractCreationTransaction } from '../types/archive';
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
  try {
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
        query ContractCreationTransactions(
          $startBlock: Float!,
          $endBlock: Float!,
          $contractAddress: String
        ) {
          contractCreationTransactions(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
              }
              receiptContractAddress: $contractAddress
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data
      .contractCreationTransactions as ContractCreationTransaction[];
  } catch (e: any) {
    throw new Error(e.message);
  }
}
