import axios from 'axios';
import { DecodedContractEvent } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof DecodedContractEvent)[] = [
  'contract',
  'transactionHash',
  'signature',
  'blockNumber',
  'blockTimestamp',
  'value1',
  'value2',
  'value3',
  'value4',
  'type1',
  'type2',
  'type3',
  'type4',
];

export default async function events({
  ercType,
  blockRange,
  contract,
  transactionHash,
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
  transactionHash?: string;
  properties?: (keyof DecodedContractEvent)[];
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
      url: endpoint(),
      method: 'post',
      data: {
        variables: {
          startBlock: blockRange?.start,
          endBlock: blockRange?.end,
          contract,
          transactionHash,
          signature,
        },
        query: `
        query ERCEvents(${blockQueryVar}$contract: String, $transactionHash: String, $signature: String) {
          erc${ercType}Events(
            filter: {
              _operators: {
                ${blockQuery}
              }
              contract: $contract
              transactionHash: $transactionHash
              signature: $signature
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data[`erc${ercType}Events`] as DecodedContractEvent[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
