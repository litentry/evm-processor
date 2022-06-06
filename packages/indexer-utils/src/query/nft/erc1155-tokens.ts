import axios from 'axios';
import { ERC1155Token } from '../../types/nft';
import endpoint from './endpoint';

const defaultProperties: (keyof ERC1155Token)[] = [
  'contract',
  'tokenId',
  'owner',
  'quantity',
  'lastTransferedBlockNumber',
  'lastTransferedBlockTimestamp',
];

export default async function erc1155Tokens({
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
  properties?: (keyof ERC1155Token)[];
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
        query ERC1155Tokens(${blockQueryVar}$contract: String, $tokenId: String, $owner: String) {
          erc1155Tokens(
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
    return response.data.data.erc1155Tokens as ERC1155Token[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
