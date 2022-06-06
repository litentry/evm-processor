import axios from 'axios';
import { ERC1155Contract } from '../../types/contract';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC1155Contract)[] = [
  'address',
  'blockNumber',
  'timestamp',
  'creator',
  'name',
  'erc165',
  'erc1155TokenReceiver',
  'erc1155MetadataURI',
];

export default async function erc1155Contracts({
  blockRange,
  contractAddress,
  erc165,
  erc1155MetadataURI,
  erc1155TokenReceiver,
  creator,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  contractAddress?: string[];
  erc165?: boolean;
  erc1155MetadataURI?: boolean;
  erc1155TokenReceiver?: boolean;
  creator?: string;
  properties?: (keyof ERC1155Contract)[];
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
          erc1155TokenReceiver,
          erc1155MetadataURI,
          creator,
        },
        query: `
        query ERC1155Contracts(${blockQueryVar}${contractAddressesVar}$erc165: Boolean, $erc1155MetadataURI: Boolean, $erc1155TokenReceiver: Boolean, $creator: String) {
          erc1155Contracts(
            filter: {
              _operators: {
                ${blockQuery}
                ${contractAddresses}
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
