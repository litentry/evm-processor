import axios from 'axios';
import { ERC1155TokenTransfer } from '../../types/nft';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC1155TokenTransfer)[] = [
  '_id',
  'from',
  'to',
  'contract',
  'tokenId',
  'collectionName',
  'blockNumber',
  'blockTimestamp',
  'transactionHash',
  'transactionId',
];

export default async function erc1155TokenTransfers({
  blockRange,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  properties?: (keyof ERC1155TokenTransfer)[];
}) {
  let blockQuery = '';
  let blockQueryVar = '';

  if (blockRange) {
    blockQueryVar = '$startBlock: Float, $endBlock: Float, ';
    blockQuery = `blockNumber: {
      gte: $startBlock,
      lte: $endBlock
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
        },
        query: `
        query ERC1155TokenTransfers(${blockQueryVar}) {
          erc1155TokenTransfers(
            filter: {
              _operators: {
                ${blockQuery}
              }
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.erc1155TokenTransfers as ERC1155TokenTransfer[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
