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
    properties: [
      '_id',
      'address',
      'topic1',
      'topic2',
      'topic3',
      'data',
      'blockNumber',
      'blockTimestamp',
      'transactionHash',
      'transactionId',
    ],
  });
  const filteredLogs = logs.filter((log) => {
    /*
    ERC721 contracts can also be matched ERC20 contracts, they have matching signatures,
    but for ERC721 the last param (token) is indexed, whereas it is the unindexed amount
    for ERC20. When indexed it appears as topic3, when unindexed it appears as data.
    */
    return !log.topic3;
  });

  // get matching erc20 contracts
  const uniqueContractAddresses = [
    ...new Set(filteredLogs.map((log) => log.address)),
  ];
  const erc20Contracts = await query.contracts.erc20Contracts({
    contractAddress: uniqueContractAddresses,
    properties: ['_id', 'decimals', 'name', 'symbol'],
  });
  const erc20ContractAddresses = erc20Contracts.map((c) => c._id);

  // filter logs with no matching contract
  const transferLogs = filteredLogs.filter((log) =>
    erc20ContractAddresses.includes(log.address),
  );

  return {
    transferLogs,
    erc20Contracts,
  };
}
