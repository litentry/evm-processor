import { query } from 'indexer-utils';
import { ExtractedTransfers } from './types';

export default async function extract(
  start: number,
  end: number,
): Promise<ExtractedTransfers> {
  const erc721Transfers = await query.nft.erc721TokenTransfers({
    blockRange: {
      start,
      end,
    },
    properties: ['blockTimestamp'],
  });

  const erc1155Transfers = await query.nft.erc1155TokenTransfers({
    blockRange: {
      start,
      end,
    },
    properties: ['blockTimestamp', 'quantity'],
  });

  return {
    erc721: erc721Transfers.map((t) => ({
      blockTimestamp: t.blockTimestamp,
      totalTransactions: 1,
      totalTokens: 1,
    })),
    erc1155: erc1155Transfers.map((t) => ({
      blockTimestamp: t.blockTimestamp,
      totalTransactions: 1,
      totalTokens: t.quantity,
    })),
  };
}
