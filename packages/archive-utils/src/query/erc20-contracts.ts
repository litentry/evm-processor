import axios from 'axios';
import { ERC20Contract } from '../types/contract';
import { contractEndpoint } from './endpoint';

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
  startBlock,
  endBlock,
  contractAddress,
  erc165,
  creator,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string[];
  erc165?: boolean;
  creator?: string;
  properties: (keyof ERC20Contract)[];
}) {
  let ids = '';
  let idsVar = '';

  if (contractAddress?.length) {
    idsVar = ', $contractAddress: [String!]';
    ids = `_id: {
      in: $contractAddress
    }`;
  }

  try {
    const response = await axios({
      url: contractEndpoint,
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
          contractAddress,
          erc165,
          creator,
        },
        query: `
        query ERC20Contracts($startBlock: Float!, $endBlock: Float!${idsVar}, $erc165: Boolean, $creator: String) {
          erc20Contracts(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
                ${ids}
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
