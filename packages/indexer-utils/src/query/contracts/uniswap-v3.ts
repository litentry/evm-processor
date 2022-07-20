import axios from 'axios';
import { UniswapV3Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof UniswapV3Contract)[] = [
  '_id',
  'blockNumber',
  'timestamp',
  'creator',
  'erc165',
];

export default async function uniswapV3Contracts({
  blockRange,
  addresses,
  erc165,
  creator,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  addresses?: string[];
  erc165?: boolean;
  creator?: string;
  properties?: (keyof UniswapV3Contract)[];
}) {
  let addressesOperator = '';
  let addressesQueryVar = '';
  let blockOperator = '';
  let blockQueryVar = '';

  if (blockRange) {
    blockQueryVar = '$startBlock: Float, $endBlock: Float, ';
    blockOperator = `blockNumber: {
      gte: $startBlock,
      lte: $endBlock
    }`;
  }

  if (addresses) {
    if (!addresses.length) return [];
    addressesQueryVar = '$addresses: [String!], ';
    addressesOperator = `_id: {
      in: $addresses
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
          addresses: addresses ? [...new Set(addresses)] : undefined,
          erc165,
          creator,
        },
        query: `
        query UniswapV3Contracts(${blockQueryVar}${addressesQueryVar}$erc165: Boolean, $creator: String) {
          uniswapV3Contracts(
            filter: {
              _operators: {
                ${blockOperator}
                ${addressesOperator}
              }
              erc165: $erc165
              creator: $creator
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.uniswapV3Contracts as UniswapV3Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
