import axios from 'axios';
import { DecodedContractTransaction } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof DecodedContractTransaction)[] = [
  'contract',
  'hash',
  'signer',
  'signature',
  'blockNumber',
  'blockTimestamp',
  'value1',
  'value2',
  'value3',
  'value4',
  'value5',
  'value6',
  'type1',
  'type2',
  'type3',
  'type4',
  'type5',
  'type6',
];

export default async function transactions({
  ercType,
  blockRange,
  contract,
  hash,
  signature,
  properties = defaultProperties,
}: {
  ercType: 20 | 721 | 1155;
  blockRange?: {
    start: number;
    end: number;
  };
  signature?: string;
  contract?: string;
  hash?: string;
  properties?: (keyof DecodedContractTransaction)[];
}) {
  let blockQuery = '';
  let blockQueryVar = '';

  if (blockRange) {
    blockQueryVar = '$startBlock: Float, $endBlock: Float, ';
    blockQuery = `blockNumber: {
      gte: $startBlock,
      lte: $endBlock
    }`;
  }

  try {
    const response = await axios({
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock: blockRange?.start,
          endBlock: blockRange?.end,
          contract,
          hash,
          signature,
        },
        query: `
        query ERCTransactions(${blockQueryVar}$contract: String, $hash: String, $signature: String) {
          erc${ercType}Transactions(
            filter: {
              _operators: {
                ${blockQuery}
              }
              contract: $contract
              hash: $hash
              signature: $signature
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data[
      `erc${ercType}Transactions`
    ] as DecodedContractTransaction[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
