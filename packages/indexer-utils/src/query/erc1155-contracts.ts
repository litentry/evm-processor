import axios from 'axios';
import { ERC1155Contract } from '../types/contract';
import { contractEndpoint } from './endpoint';

const defaultProperties: (keyof ERC1155Contract)[] = [
  '_id',
  'blockNumber',
  'timestamp',
  'creator',
  'name',
  'erc165',
  'erc1155TokenReceiver',
  'erc1155MetadataURI',
];

export default async function erc1155Contracts({
  startBlock,
  endBlock,
  contractAddress,
  erc165,
  erc1155MetadataURI,
  erc1155TokenReceiver,
  creator,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string[];
  erc165?: boolean;
  erc1155MetadataURI?: boolean;
  erc1155TokenReceiver?: boolean;
  creator?: string;
  properties?: (keyof ERC1155Contract)[];
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
          erc1155TokenReceiver,
          erc1155MetadataURI,
          creator,
        },
        query: `
        query ERC1155Contracts($startBlock: Float!, $endBlock: Float!${idsVar}, $erc165: Boolean, $erc1155MetadataURI: Boolean, $erc1155TokenReceiver: Boolean, $creator: String) {
          erc1155Contracts(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
                ${ids}
              }
              erc165: $erc165
              erc1155MetadataURI: $erc1155MetadataURI
              erc1155TokenReceiver: $erc1155TokenReceiver
              creator: $creator
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.erc1155Contracts as ERC1155Contract[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
