import { Types } from 'indexer-utils';

export default function mapErc721TransfersToTokens(
  transfers: Types.Nft.ERC721TokenTransfer[],
): Types.Nft.ERC721Token[] {
  return transfers.map((transfer) => ({
    _id: `${transfer.contract}.${transfer.tokenId}`,
    contract: transfer.contract,
    lastTransferedBlockNumber: transfer.blockNumber,
    lastTransferedBlockTimestamp: transfer.blockTimestamp,
    tokenId: transfer.tokenId,
    owner: transfer.to,
    collectionName: transfer.collectionName,
  }));
}
