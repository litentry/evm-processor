import { query } from 'indexer-utils';
import { ExtractedNFTData } from '../types';
import getLogs from './get-logs';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTData> {
  const {
    erc1155TransferBatchLogs,
    erc1155TransferSingleLogs,
    erc721TransferLogs,
  } = await getLogs(startBlock, endBlock);

  // fetch contracts
  const unique721ContractAddresses = [
    ...new Set(erc721TransferLogs.map((log) => log.address)),
  ];
  const unique1155ContractAddresses = [
    ...new Set([
      ...erc1155TransferSingleLogs.map((log) => log.address),
      ...erc1155TransferBatchLogs.map((log) => log.address),
    ]),
  ];
  const [erc721Contracts, erc1155Contracts] = await Promise.all([
    query.contracts.erc721Contracts({
      contractAddress: unique721ContractAddresses,
    }),
    query.contracts.erc1155Contracts({
      contractAddress: unique1155ContractAddresses,
    }),
  ]);
  const erc721ContractAddresses = erc721Contracts.map((c) => c._id);
  const erc1155ContractAddresses = erc1155Contracts.map((c) => c._id);

  // filter Logs without matching contracts and return
  return {
    erc721TransferLogs: erc721TransferLogs.filter((log) =>
      erc721ContractAddresses.includes(log.address),
    ),
    erc1155TransferSingleLogs: erc1155TransferSingleLogs.filter((log) =>
      erc1155ContractAddresses.includes(log.address),
    ),
    erc1155TransferBatchLogs: erc1155TransferBatchLogs.filter((log) =>
      erc1155ContractAddresses.includes(log.address),
    ),
    erc721Contracts,
    erc1155Contracts,
  };
}
