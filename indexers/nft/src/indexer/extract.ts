import { query } from 'indexer-utils';
import { TRANSFER_1155, TRANSFER_1155_BATCH, TRANSFER_721 } from './constants';
import { ExtractedNFTData } from './types';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTData> {
  const data: ExtractedNFTData = {
    erc721TransferEvents: [],
    erc1155TransferSingleEvents: [],
    erc1155TransferBatchEvents: [],
    erc721Contracts: [],
    erc1155Contracts: [],
  };
  // payloads can be too bit for api gateway, so no matter batch size we query a block at a time
  const blocks: number[] = [];
  for (let block = startBlock; block <= endBlock; block++) {
    blocks.push(block);
  }
  const _data = await Promise.all(blocks.map(extractBlock));

  _data.forEach((response) => {
    data.erc721TransferEvents.push(...response.erc721TransferEvents);
    data.erc1155TransferSingleEvents.push(
      ...response.erc1155TransferSingleEvents,
    );
    data.erc1155TransferBatchEvents.push(
      ...response.erc1155TransferBatchEvents,
    );
    data.erc721Contracts.push(...response.erc721Contracts);
    data.erc1155Contracts.push(...response.erc1155Contracts);
  });

  return data;
}

async function extractBlock(block: number): Promise<ExtractedNFTData> {
  // fetch event logs
  const [
    erc721TransferEvents,
    erc1155TransferSingleEvents,
    erc1155TransferBatchEvents,
  ] = await Promise.all([
    getErc721TransferEvents(block),
    getErc1155TransferEvents(block, TRANSFER_1155),
    getErc1155TransferEvents(block, TRANSFER_1155_BATCH),
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

async function getErc721TransferEvents(block: number) {
  const logs1 = await query.archive.logs({
    startBlock: block,
    endBlock: block,
    eventId: TRANSFER_721,
    hasTopic3: true,
    properties: ['address', 'topic1', 'topic2', 'topic3', 'data', '_id'],
  });

  const logs2 = await query.archive.logs({
    startBlock: block,
    endBlock: block,
    eventId: TRANSFER_721,
    properties: [
      '_id',
      'transactionHash',
      'transactionId',
      'blockNumber',
      'blockTimestamp',
      'logIndex',
    ],
  });

  return logs1.map((log) => {
    const matchingLog = logs2.find((l) => l._id === log._id)!;
    return {
      ...log,
      ...matchingLog,
    };
  });
}

async function getErc1155TransferEvents(block: number, eventId: string) {
  const logs1 = await query.archive.logs({
    startBlock: block,
    endBlock: block,
    eventId,
    properties: ['topic1', 'topic2', 'topic3', 'topic4', 'data', '_id'],
  });
  const logs2 = await query.archive.logs({
    startBlock: block,
    endBlock: block,
    eventId,
    properties: [
      'address',
      'transactionHash',
      'transactionId',
      'blockNumber',
      'blockTimestamp',
      'logIndex',
      '_id',
    ],
  });

  return logs1.map((log) => {
    const matchingLog = logs2.find((l) => l._id === log._id)!;
    return {
      ...log,
      ...matchingLog,
    };
  });
}
