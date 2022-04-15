import axios from 'axios';
import { Log } from '../types/archive';
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

export default async function logs(
  startBlock: number,
  endBlock: number,
  contractAddress?: string,
  eventId?: string,
  transactionHash?: string,
  properties: (keyof Log)[] = defaultProperties
) {
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
        query Logs($startBlock: Int!, $endBlock: Int!, $contractAddress: String, $eventId: String, $transactionHash: String) {
          logs(
            startBlock: $startBlock,
            endBlock: $endBlock,
            contractAddress: $contractAddress,
            eventId: $eventId,
            transactionHash: $transactionHash
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.logs as Log[];
  } catch (e: any) {
    throw new Error(e.message);
  }
}
