import axios from 'axios';
import { UniswapV3Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof UniswapV3Contract)[] = [
  'address',
  'blockNumber',
  'timestamp',
  'creator',
  'erc165',
];

export default async function uniswapV3Contracts({
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
  properties?: (keyof UniswapV3Contract)[];
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

  if (contractAddress?.length) {
    contractAddressesVar = '$contractAddress: [String!], ';
    contractAddresses = `address: {
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
        query UniswapV3Contracts(${blockQueryVar}${contractAddressesVar}$erc165: Boolean, $creator: String) {
          uniswapV3Contracts(
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
    return response.data.data.uniswapV3Contracts as UniswapV3Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
