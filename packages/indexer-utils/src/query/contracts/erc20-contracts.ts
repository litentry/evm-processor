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
  properties?: (keyof ERC20Contract)[];
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
        query ERC20Contracts(${blockQueryVar}${contractAddressesVar}$erc165: Boolean, $creator: String) {
          erc20Contracts(
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
    return response.data.data.erc20Contracts as ERC20Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
