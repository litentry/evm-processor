import { utils, query } from 'indexer-utils';

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

export default async function extract(startBlock: number, endBlock: number) {
  const [events721, eventsSingle1155, eventsBatch1155] = await Promise.all([
    fetch721Events(startBlock, endBlock),
    fetch1155Events(startBlock, endBlock),
    fetch1155BatchEvents(startBlock, endBlock),
  ]);

  return {
    events721,
    eventsSingle1155,
    eventsBatch1155,
  };
}

export async function fetch721Events(start: number, end: number) {
  const events = await query.tokenActivity.events({
    blockRange: { start, end },
    ercType: 721,
    signature: TRANSFER_721.SIGNATURE,
    properties: [
      'contract',
      'blockNumber',
      'blockTimestamp',
      'value1',
      'value2',
      'value3',
    ],
  });

  return events;
}

export async function fetch1155Events(start: number, end: number) {
  const events = await query.tokenActivity.events({
    blockRange: { start, end },
    ercType: 1155,
    signature: TRANSFER_1155.SIGNATURE,
    properties: [
      'contract',
      'blockNumber',
      'blockTimestamp',
      'value2',
      'value3',
      'value4',
      'value5',
    ],
  });

  return events;
}

export async function fetch1155BatchEvents(start: number, end: number) {
  const events = await query.tokenActivity.events({
    blockRange: { start, end },
    ercType: 1155,
    signature: TRANSFER_1155_BATCH.SIGNATURE,
    properties: [
      'contract',
      'blockNumber',
      'blockTimestamp',
      'value2',
      'value3',
      'value4',
      'value5',
    ],
  });

  return events;
}
