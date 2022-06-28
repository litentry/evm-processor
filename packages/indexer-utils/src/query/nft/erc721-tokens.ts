import axios from 'axios';
import { ERC721Token } from '../../types/nft';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC721Token)[] = [
  '_id',
  'contract',
  'tokenId',
  'owner',
  'lastTransferedBlockNumber',
  'lastTransferedBlockTimestamp',
];

export default async function erc721Tokens({
  blockRange,
  contract,
  tokenId,
  owner,
  properties = defaultProperties,
}: {
  blockRange?: {
    start: number;
    end: number;
  };
  contract?: string;
  tokenId?: string;
  owner?: string;
  properties?: (keyof ERC721Token)[];
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
          contract,
          tokenId,
          owner,
        },
        query: `
        query ERC721Tokens(${blockQueryVar}$contract: String, $tokenId: String, $owner: String) {
          erc721Tokens(
            filter: {
              _operators: {
                ${blockQuery}
              }
              contract: $contract
              tokenId: $tokenId
              owner: $owner
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.erc721Tokens as ERC721Token[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
