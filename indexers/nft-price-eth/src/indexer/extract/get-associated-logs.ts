import { query } from 'indexer-utils';
import { TRANSFER, TRANSFER_BATCH, TRANSFER_SINGLE } from '../constants';
import { AssociatedLogs } from '../types';

export default async function getAssociatedLogs(
  startBlock: number,
  endBlock: number,
  transactionHashes: string[],
) {
  try {
    const logs = await getLogs(startBlock, endBlock, transactionHashes);
    return logs;
  } catch (e) {
    const logs: AssociatedLogs = {
      erc20: [],
      erc721: [],
      erc1155Single: [],
      erc1155Batch: [],
    };

    let block = startBlock;
    while (block <= endBlock) {
      const _logs = await getLogs(block, block, transactionHashes);

      logs.erc20.push(..._logs.erc20);
      logs.erc721.push(..._logs.erc721);
      logs.erc1155Single.push(..._logs.erc1155Single);
      logs.erc1155Batch.push(..._logs.erc1155Batch);

      block++;
    }

    return logs;
  }
}

async function getLogs(
  startBlock: number,
  endBlock: number,
  transactionHashes: string[],
) {
  const [erc20, erc721, erc1155Single, erc1155Batch] = await Promise.all([
    query.archive.logs({
      startBlock,
      endBlock,
      transactionHashes,
      eventId: TRANSFER.ID,
      hasTopic3: false,
      properties: [
        '_id',
        'transactionHash',
        'data',
        'topic1',
        'topic2',
        'topic3',
        'transactionHash',
        'address',
      ],
    }),
    query.archive.logs({
      startBlock,
      endBlock,
      transactionHashes,
      eventId: TRANSFER.ID,
      hasTopic3: true,
      properties: [
        '_id',
        'blockNumber',
        'blockTimestamp',
        'transactionHash',
        'data',
        'topic1',
        'topic2',
        'topic3',
        'transactionHash',
        'address',
      ],
    }),
    query.archive.logs({
      startBlock,
      endBlock,
      transactionHashes,
      eventId: TRANSFER_SINGLE.ID,
      properties: [
        '_id',
        'blockNumber',
        'blockTimestamp',
        'transactionHash',
        'data',
        'topic1',
        'topic2',
        'topic3',
        'transactionHash',
        'address',
      ],
    }),
    query.archive.logs({
      startBlock,
      endBlock,
      transactionHashes,
      eventId: TRANSFER_BATCH.ID,
      properties: [
        '_id',
        'blockNumber',
        'blockTimestamp',
        'transactionHash',
        'data',
        'topic1',
        'topic2',
        'topic3',
        'transactionHash',
        'address',
      ],
    }),
  ]);
  return { erc20, erc721, erc1155Single, erc1155Batch };
}
