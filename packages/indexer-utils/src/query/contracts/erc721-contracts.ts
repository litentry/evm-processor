import axios from 'axios';
import { ERC721Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC721Contract)[] = [
  'address',
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
  contractAddress,
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
  contractAddress?: string[];
  erc165?: boolean;
  erc721Enumerable?: boolean;
  erc721Metadata?: boolean;
  erc721TokenReceiver?: boolean;
  creator?: string;
  properties?: (keyof ERC721Contract)[];
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
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock: blockRange?.start,
          endBlock: blockRange?.end,
          contractAddress,
          erc165,
          erc721Enumerable,
          erc721TokenReceiver,
          erc721Metadata,
          creator,
        },
        query: `
        query ERC721Contracts(${blockQueryVar}${contractAddressesVar}$erc165: Boolean, $erc721Enumerable: Boolean, $erc721Metadata: Boolean, $erc721TokenReceiver: Boolean, $creator: String) {
          erc721Contracts(
            filter: {
              _operators: {
                ${blockQuery}
                ${contractAddresses}
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
