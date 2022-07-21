import { query, Types } from 'indexer-utils';
import { ExtractedData } from './types';
import { TRANSFER_EVENT_SIGNATURE } from './utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedData> {
  const logs = await getLogs(startBlock, endBlock);

  // get matching erc20 contracts
  const uniqueContractAddresses = [...new Set(logs.map((log) => log.address))];
  const erc20Contracts = await query.contracts.erc20Contracts({
    addresses: uniqueContractAddresses,
    properties: ['_id', 'decimals', 'name', 'symbol'],
  });
  const erc20ContractAddresses = erc20Contracts.map((c) => c._id);

  // filter logs with no matching contract
  const transferLogs = logs.filter((log) =>
    erc20ContractAddresses.includes(log.address),
  );

  return {
    transferLogs,
    erc20Contracts,
  };
}

async function getLogs(startBlock: number, endBlock: number) {
  try {
    const logs = await query.archive.logs({
      startBlock,
      endBlock,
      eventId: TRANSFER_EVENT_SIGNATURE,
      hasTopic3: false,
      properties: [
        '_id',
        'address',
        'topic1',
        'topic2',
        'data',
        'blockNumber',
        'blockTimestamp',
        'transactionHash',
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
        eventId: TRANSFER_EVENT_SIGNATURE,
        hasTopic3: false,
        properties: [
          '_id',
          'address',
          'topic1',
          'topic2',
          'data',
          'blockNumber',
          'blockTimestamp',
          'transactionHash',
        ],
      });
      logs.push(..._logs);

      block++;
    }

    return logs;
  }
}
