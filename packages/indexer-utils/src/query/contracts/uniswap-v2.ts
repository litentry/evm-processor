import axios from 'axios';
import { UniswapV2Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof UniswapV2Contract)[] = [
  '_id',
  'blockNumber',
  'timestamp',
  'creator',
  'erc165',
];

export default async function uniswapV2Contracts({
  blockRange,
  contractAddress,
  erc165,
  creator,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  contractAddress?: string[];
  erc165?: boolean;
  creator?: string;
  properties?: (keyof UniswapV2Contract)[];
}) {
  let contractAddresses = '';
  let contractAddressesVar = '';
  let blockQuery = '';
  let blockQueryVar = '';

  if (blockRange) {
    blockQueryVar = '$startBlock: Float, $endBlock: Float, ';
    blockQuery = `blockNumber: {
      gte: $startBlock,
      lte: $endBlock
    }`;
  }

  if (contractAddress) {
    if (!contractAddress.length) return [];
    contractAddressesVar = '$contractAddress: [String!], ';
    contractAddresses = `_id: {
      in: $contractAddress
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
          contractAddress,
          erc165,
          creator,
        },
        query: `
        query UniswapV2Contracts(${blockQueryVar}${contractAddressesVar}$erc165: Boolean, $creator: String) {
          uniswapV2Contracts(
            filter: {
              _operators: {
                ${blockQuery}
                ${contractAddresses}
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
    return response.data.data.uniswapV2Contracts as UniswapV2Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
