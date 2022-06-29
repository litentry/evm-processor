import { query, utils } from 'indexer-utils';
import { ExtractedData } from './types';

const signature = utils.contract.CONTRACT_SIGNATURES.ERC20.EVENTS.find(
  (item) => item.SIGNATURE === 'Transfer(address,address,uint256)',
)!;

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedData> {
  // get logs
  const logs = await query.archive.logs({
    startBlock,
    endBlock,
    eventId: `0x${signature.ID}`,
  });

  // get matching erc20 contracts
  const uniqueContractAddresses = [
    ...new Set(logs.flat().map((log) => log.address)),
  ];
  const erc20Contracts = await query.contracts.erc20Contracts({
    contractAddress: uniqueContractAddresses,
    properties: ['_id', 'decimals', 'name', 'symbol'],
  });
  const erc20ContractAddresses = erc20Contracts.map((c) => c._id);

  // filter logs with no matching contract
  const transferLogs = logs
    .flat()
    .filter((log) => erc20ContractAddresses.includes(log.address));

  return {
    transferLogs,
    erc20Contracts,
  };
}
