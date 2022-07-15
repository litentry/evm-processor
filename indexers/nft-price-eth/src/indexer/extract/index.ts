import _ from 'lodash';
import { ExtractedNFTPriceData } from '../types';
import getAssociatedContracts from './get-associated-contracts';
import getAssociatedLogs from './get-associated-logs';
import getOpenseaWyvernLogs from './get-opensea-wyvern-logs';

/*
The takers are all Uniswap, but the sellers are all the correct owners

We can match the Opensea maker address with the transfer from address, then get the buyer from the transfer to address
*/
export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTPriceData> {
  const [openseaV1, openseaV2] = await Promise.all([
    getOpenseaWyvernLogs(startBlock, endBlock, 'V1'),
    getOpenseaWyvernLogs(startBlock, endBlock, 'V2'),
  ]);
  const allOpenseaLogs = [...openseaV1, ...openseaV2];
  const transactionIds = allOpenseaLogs.map((log) => log.transactionId);

  const associatedLogs = await getAssociatedLogs(startBlock, endBlock, [
    ...new Set(transactionIds),
  ]);
  const associatedContracts = await getAssociatedContracts(associatedLogs);

  // const [erc721TokenTransfers, erc1155TokenTransfers, erc20TokenTransfers] =
  //   await getTransfers(transactionIds);
  const erc721LogsByTxId = _.groupBy(associatedLogs.erc721, 'transactionId');
  const erc1155SingleLogsByTxId = _.groupBy(
    associatedLogs.erc1155Single,
    'transactionId',
  );
  const erc1155BatchLogsByTxId = _.groupBy(
    associatedLogs.erc1155Batch,
    'transactionId',
  );
  const erc20LogsByTxId = _.groupBy(associatedLogs.erc20, 'transactionId');

  return {
    associatedContracts,
    openseaLogs: [...openseaV1, ...openseaV2].map((log) => {
      return {
        ...log,
        associatedLogs: {
          erc20: erc20LogsByTxId[log.transactionId] || [],
          erc721: erc721LogsByTxId[log.transactionId] || [],
          erc1155Single: erc1155SingleLogsByTxId[log.transactionId] || [],
          erc1155Batch: erc1155BatchLogsByTxId[log.transactionId] || [],
        },
      };
    }),
  };
}
