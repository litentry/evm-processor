import axios from 'axios';
import { ERC721Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC721Contract)[] = [
  '_id',
  'blockNumber',
  'timestamp',
  'creator',
  'name',
  'erc165',
  'erc721Enumerable',
  'erc721Metadata',
  'erc721TokenReceiver',
];

export default async function erc721Contracts({
  blockRange,
  addresses,
  erc165,
  erc721Enumerable,
  erc721Metadata,
  erc721TokenReceiver,
  creator,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  addresses?: string[];
  erc165?: boolean;
  erc721Enumerable?: boolean;
  erc721Metadata?: boolean;
  erc721TokenReceiver?: boolean;
  creator?: string;
  properties?: (keyof ERC721Contract)[];
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
          erc721Enumerable,
          erc721TokenReceiver,
          erc721Metadata,
          creator,
        },
        query: `
        query ERC721Contracts(${blockQueryVar}${addressesQueryVar}$erc165: Boolean, $erc721Enumerable: Boolean, $erc721Metadata: Boolean, $erc721TokenReceiver: Boolean, $creator: String) {
          erc721Contracts(
            filter: {
              _operators: {
                ${blockOperator}
                ${addressesOperator}
              }
              erc165: $erc165
              erc721Enumerable: $erc721Enumerable
              erc721Metadata: $erc721Metadata
              erc721TokenReceiver: $erc721TokenReceiver
              creator: $creator
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.erc721Contracts as ERC721Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
