import axios from 'axios';
import { ERC721TokenTransfer } from '../../types/nft';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC721TokenTransfer)[] = [
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

export default async function erc721TokenTransfers({
  blockRange,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  properties?: (keyof ERC721TokenTransfer)[];
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
        query ERC721TokenTransfers(${blockQueryVar}) {
          erc721TokenTransfers(
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
    return response.data.data.erc721TokenTransfers as ERC721TokenTransfer[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
