import axios from 'axios';
import { Log } from '../../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof Log)[] = [
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
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  contractAddress?: string;
  eventId?: string;
  transactionHash?: string;
  properties?: (keyof Log)[];
}) {
  try {
    const response = await axios({
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
          contractAddress,
          eventId,
          transactionHash,
        },
        query: `
        query Logs(
          $startBlock: Float!,
          $endBlock: Float!,
          $contractAddress: String,
          $eventId: String,
          $transactionHash: String
        ) {
          logs(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
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
