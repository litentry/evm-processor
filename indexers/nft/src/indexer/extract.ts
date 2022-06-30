import { utils, query } from 'indexer-utils';
import { ExtractedNFTData } from './types';

const TRANSFER_721 = utils.contract.CONTRACT_SIGNATURES.ERC721.EVENTS.find(
  (ex) => ex.SIGNATURE === 'Transfer(address,address,uint256)',
)!;
const TRANSFER_1155 = utils.contract.CONTRACT_SIGNATURES.ERC1155.EVENTS.find(
  (ex) =>
    ex.SIGNATURE === 'TransferSingle(address,address,address,uint256,uint256)',
)!;
const TRANSFER_1155_BATCH =
  utils.contract.CONTRACT_SIGNATURES.ERC1155.EVENTS.find(
    (ex) =>
      ex.SIGNATURE ===
      'TransferBatch(address,address,address,uint256[],uint256[])',
  )!;

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTData> {
  // fetch event logs
  const [
    erc721TransferEvents,
    erc1155TransferSingleEvents,
    erc1155TransferBatchEvents,
  ] = await Promise.all([
    (
      await query.archive.logs({
        startBlock,
        endBlock,
        eventId: `0x${TRANSFER_721.SIGNATURE}`,
      })
    ).filter((log) => {
      /*
      ERC721 contracts can also be matched ERC20 contracts, they have matching signatures,
      but for ERC721 the last param (token) is indexed, whereas it is the unindexed amount
      for ERC20. When indexed it appears as topic3, when unindexed it appears as data.
      */
      return !!log.topic3;
    }),
    query.archive.logs({
      startBlock,
      endBlock,
      eventId: `0x${TRANSFER_1155.SIGNATURE}`,
    }),
    query.archive.logs({
      startBlock,
      endBlock,
      eventId: `0x${TRANSFER_1155_BATCH.SIGNATURE}`,
    }),
  ]);

  // fetch contracts
  const unique721ContractAddresses = [
    ...new Set(erc721TransferEvents.map((log) => log.address)),
  ];
  const unique1155ContractAddresses = [
    ...new Set([
      ...erc1155TransferSingleEvents.map((log) => log.address),
      ...erc1155TransferBatchEvents.map((log) => log.address),
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

  // filter events without matching contracts and return
  return {
    erc721TransferEvents: erc721TransferEvents.filter((log) =>
      erc721ContractAddresses.includes(log.address),
    ),
    erc1155TransferSingleEvents: erc1155TransferSingleEvents.filter((log) =>
      erc1155ContractAddresses.includes(log.address),
    ),
    erc1155TransferBatchEvents: erc1155TransferBatchEvents.filter((log) =>
      erc1155ContractAddresses.includes(log.address),
    ),
    erc721Contracts,
    erc1155Contracts,
  };
}
