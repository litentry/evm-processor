import { Types } from 'indexer-utils';
import _ from 'lodash';
import { ExtractedMarketplaceData } from '../types';
import getAssociatedContracts from './get-associated-contracts';
import getAssociatedLogs from './get-associated-logs';

export default async function applyAssociatedData(
  logs: Types.Archive.Log[],
  startBlock: number,
  endBlock: number,
): Promise<ExtractedMarketplaceData> {
  const transactionHashes = logs.map((log) => log.transactionHash);

  if (!transactionHashes.length) {
    return {
      logs: [],
      associatedContracts: {
        erc20: [],
        erc1155: [],
        erc721: [],
      },
    };
  }

  const associatedLogs = await getAssociatedLogs(startBlock, endBlock, [
    ...new Set(transactionHashes),
  ]);
  const associatedContracts = await getAssociatedContracts(associatedLogs);

  const erc721LogsByTxId = _.groupBy(associatedLogs.erc721, 'transactionHash');
  const erc1155SingleLogsByTxId = _.groupBy(
    associatedLogs.erc1155Single,
    'transactionHash',
  );
  const erc1155BatchLogsByTxId = _.groupBy(
    associatedLogs.erc1155Batch,
    'transactionHash',
  );
  const erc20LogsByTxId = _.groupBy(associatedLogs.erc20, 'transactionHash');

  return {
    logs: logs.map((log) => ({
      ...log,
      associatedLogs: {
        erc20: erc20LogsByTxId[log.transactionHash] || [],
        erc721: erc721LogsByTxId[log.transactionHash] || [],
        erc1155Single: erc1155SingleLogsByTxId[log.transactionHash] || [],
        erc1155Batch: erc1155BatchLogsByTxId[log.transactionHash] || [],
      },
    })),
    associatedContracts,
  };
}
