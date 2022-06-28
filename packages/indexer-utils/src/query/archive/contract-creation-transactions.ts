import axios from 'axios';
import { ContractCreationTransaction } from '../../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof ContractCreationTransaction)[] = [
  '_id',
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

export default async function contractCreationTransactions({
  startBlock,
  endBlock,
  contractAddress,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string;
  properties?: (keyof ContractCreationTransaction)[];
}) {
  try {
    const response = await axios({
      url: endpoint(),
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
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
