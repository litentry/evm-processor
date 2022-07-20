import { query, Types } from 'indexer-utils';
import { X2Y2 } from '../constants';

export async function getX2Y2Logs(startBlock: number, endBlock: number) {
  const proxyVersion = 'PROXY';
  if (endBlock < X2Y2[proxyVersion].DEPLOYMENT_BLOCK) {
    return [];
  }

  const querySpec = {
    contractAddress: X2Y2[proxyVersion].ADDRESS,
    eventId: X2Y2.EVENT_HASH,
    properties: [
      'transactionId',
      'data',
      'topic0',
      'topic1',
      'topic2',
      'transactionHash',
      'address',
    ] as (keyof Types.Archive.Log)[],
  };

  try {
    return await query.archive.logs({
      startBlock,
      endBlock,
      ...querySpec,
    });
  } catch (e) {
    const logs: Types.Archive.Log[] = [];

    for (let block = startBlock; block <= endBlock; block++) {
      const _logs = await query.archive.logs({
        startBlock: block,
        endBlock: block,
        ...querySpec,
      });
      logs.push(..._logs);

      block++;
    }

    return logs;
  }
}

export default getX2Y2Logs;
