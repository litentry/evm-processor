import { query, Types } from 'indexer-utils';
import { OPENSEA_WYVERN } from '../constants';

export default async function getOpenseaWyvernLogs(
  startBlock: number,
  endBlock: number,
  version: 'V1' | 'V2',
) {
  if (endBlock < OPENSEA_WYVERN[version].DEPLOYMENT_BLOCK) {
    return [];
  }

  try {
    const logs = await query.archive.logs({
      startBlock,
      endBlock,
      contractAddress: OPENSEA_WYVERN[version].ADDRESS,
      eventId: OPENSEA_WYVERN.EVENT_HASH,
      properties: [
        'data',
        'topic1',
        'topic2',
        'topic3',
        'transactionHash',
        'address',
      ],
    });
    return logs;
  } catch (e) {
    const logs: Types.Archive.Log[] = [];

    let block = startBlock;
    while (block <= endBlock) {
      const _logs = await query.archive.logs({
        startBlock: block,
        endBlock: block,
        contractAddress: OPENSEA_WYVERN[version].ADDRESS,
        eventId: OPENSEA_WYVERN.EVENT_HASH,
        properties: [
          'data',
          'topic1',
          'topic2',
          'topic3',
          'transactionHash',
          'address',
        ],
      });
      logs.push(..._logs);

      block++;
    }

    return logs;
  }
}
