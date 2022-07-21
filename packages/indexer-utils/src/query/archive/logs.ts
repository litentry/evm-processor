import axios from 'axios';
import { Log } from '../../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof Log)[] = [
  '_id',
  'blockNumber',
  'blockTimestamp',
  'transactionHash',
  'address',
  'topic0',
  'topic1',
  'topic2',
  'topic3',
  'topic4',
  'data',
  'logIndex',
];

export default async function logs({
  startBlock,
  endBlock,
  contractAddress,
  eventId,
  transactionHash,
  transactionHashes,
  hasTopic3,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string;
  eventId?: string;
  transactionHash?: string;
  transactionHashes?: string[];
  hasTopic3?: boolean;
  properties?: (keyof Log)[];
}) {
  let transactionHashQuery = '';
  let transactionHashQueryVar = '';
  if (transactionHashes) {
    if (!transactionHashes.length) return [];
    transactionHashQueryVar = '$transactionHashes: [String!],';
    transactionHashQuery = `transactionHash: {
      in: $transactionHashes
    }`;
  }

  /*
    ERC721 contracts can also be matched ERC20 contracts, they have matching signatures,
    but for ERC721 the last param (token) is indexed, whereas it is the unindexed amount
    for ERC20. When indexed it appears as topic3, when unindexed it appears as data.
    */
  let topic3Query = '';
  let topic3QueryVar = '';
  if (hasTopic3 !== undefined) {
    topic3QueryVar = '$hasTopic3: Boolean,';
    topic3Query = `topic3: {
      exists: $hasTopic3
    }`;
  }

  try {
    const response = await axios({
      url: endpoint(),
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
          contractAddress,
          eventId,
          transactionHash,
          transactionHashes,
          hasTopic3,
        },
        query: `
        query Logs(
          $startBlock: Float!,
          $endBlock: Float!,
          $contractAddress: String,
          $eventId: String,
          ${topic3QueryVar}
          ${transactionHashQueryVar}
          $transactionHash: String
        ) {
          logs(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
                ${topic3Query}
                ${transactionHashQuery}
              }
              address: $contractAddress,
              topic0: $eventId,
              transactionHash: $transactionHash
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.logs as Log[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
