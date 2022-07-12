import { query } from 'indexer-utils';
import { ExtractedData } from './types';
import { TRANSFER_EVENT_SIGNATURE } from './utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedData> {
  // get logs
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
      'transactionId',
    ],
  });

  // get matching erc20 contracts
  const uniqueContractAddresses = [...new Set(logs.map((log) => log.address))];
  const erc20Contracts = await query.contracts.erc20Contracts({
    contractAddress: uniqueContractAddresses,
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
