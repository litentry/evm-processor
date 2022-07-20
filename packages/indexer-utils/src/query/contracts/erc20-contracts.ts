import axios from 'axios';
import { ERC20Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC20Contract)[] = [
  '_id',
  'blockNumber',
  'timestamp',
  'creator',
  'symbol',
  'name',
  'decimals',
  'erc165',
];

export default async function erc20Contracts({
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
  properties?: (keyof ERC20Contract)[];
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
        query ERC20Contracts(${blockQueryVar}${addressesQueryVar}$erc165: Boolean, $creator: String) {
          erc20Contracts(
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
    return response.data.data.erc20Contracts as ERC20Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
