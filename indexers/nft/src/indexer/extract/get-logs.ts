import { query, Types } from 'indexer-utils';
import { TRANSFER_1155, TRANSFER_1155_BATCH, TRANSFER_721 } from '../constants';

// payloads can be too big for api gateway, so no matter the batch size we fall back to querying a block at a time before reporting an error, and we also try split log queries
export default async function getLogs(startBlock: number, endBlock: number) {
  try {
    const [
      erc721TransferLogs,
      erc1155TransferSingleLogs,
      erc1155TransferBatchLogs,
    ] = await Promise.all([
      getErc721TransferLogs(startBlock, endBlock),
      getErc1155TransferLogs(startBlock, endBlock, TRANSFER_1155),
      getErc1155TransferLogs(startBlock, endBlock, TRANSFER_1155_BATCH),
    ]);

    return {
      erc721TransferLogs,
      erc1155TransferSingleLogs,
      erc1155TransferBatchLogs,
    };
  } catch (e) {
    const data: {
      erc721TransferLogs: Types.Archive.Log[];
      erc1155TransferSingleLogs: Types.Archive.Log[];
      erc1155TransferBatchLogs: Types.Archive.Log[];
    } = {
      erc721TransferLogs: [],
      erc1155TransferSingleLogs: [],
      erc1155TransferBatchLogs: [],
    };

    let block = startBlock;
    while (block <= endBlock) {
      const [
        erc721TransferLogs,
        erc1155TransferSingleLogs,
        erc1155TransferBatchLogs,
      ] = await Promise.all([
        getErc721TransferLogs(block, block),
        getErc1155TransferLogs(block, block, TRANSFER_1155),
        getErc1155TransferLogs(block, block, TRANSFER_1155_BATCH),
      ]);

      data.erc721TransferLogs.push(...erc721TransferLogs);
      data.erc1155TransferSingleLogs.push(...erc1155TransferSingleLogs);
      data.erc1155TransferBatchLogs.push(...erc1155TransferBatchLogs);

      block++;
    }

    return data;
  }
}

async function getErc721TransferLogs(startBlock: number, endBlock: number) {
  try {
    return query.archive.logs({
      startBlock,
      endBlock,
      eventId: TRANSFER_721,
      hasTopic3: true,
      properties: [
        'address',
        'topic1',
        'topic2',
        'topic3',
        'data',
        '_id',
        'transactionHash',
        'transactionId',
        'blockNumber',
        'blockTimestamp',
        'logIndex',
      ],
    });
  } catch (e) {
    const [logs1, logs2] = await Promise.all([
      query.archive.logs({
        startBlock,
        endBlock,
        eventId: TRANSFER_721,
        hasTopic3: true,
        properties: ['address', 'topic1', 'topic2', 'topic3', 'data', '_id'],
      }),
      query.archive.logs({
        startBlock,
        endBlock,
        eventId: TRANSFER_721,
        properties: [
          '_id',
          'transactionHash',
          'transactionId',
          'blockNumber',
          'blockTimestamp',
          'logIndex',
        ],
      }),
    ]);

    return logs1.map((log) => {
      const matchingLog = logs2.find((l) => l._id === log._id)!;
      return {
        ...log,
        ...matchingLog,
      };
    });
  }
}

async function getErc1155TransferLogs(
  startBlock: number,
  endBlock: number,
  eventId: string,
) {
  try {
    return query.archive.logs({
      startBlock,
      endBlock,
      eventId,
      properties: [
        'address',
        'transactionHash',
        'transactionId',
        'blockNumber',
        'blockTimestamp',
        'logIndex',
        'topic1',
        'topic2',
        'topic3',
        'topic4',
        'data',
        '_id',
      ],
    });
  } catch (e) {
    const [logs1, logs2] = await Promise.all([
      query.archive.logs({
        startBlock,
        endBlock,
        eventId,
        properties: ['topic1', 'topic2', 'topic3', 'topic4', 'data', '_id'],
      }),
      query.archive.logs({
        startBlock,
        endBlock,
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
      }),
    ]);

    return logs1.map((log) => {
      const matchingLog = logs2.find((l) => l._id === log._id)!;
      return {
        ...log,
        ...matchingLog,
      };
    });
  }
}
