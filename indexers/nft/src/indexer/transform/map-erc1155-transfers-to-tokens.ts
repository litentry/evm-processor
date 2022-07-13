import { Types } from 'indexer-utils';

export default function mapErc1155TransfersToTokens(
  transfers: Types.Nft.ERC1155TokenTransfer[],
): Types.Nft.ERC1155Token[] {
  return transfers
    .flatMap((transfer) => [
      {
        _id: `${transfer.contract}.${transfer.tokenId}.${transfer.from}`,
        contract: transfer.contract,
        tokenId: transfer.tokenId,
        owner: transfer.from,
        quantity: `-${transfer.quantity}`,
        collectionName: transfer.collectionName,
      },
      {
        _id: `${transfer.contract}.${transfer.tokenId}.${transfer.to}`,
        contract: transfer.contract,
        tokenId: transfer.tokenId,
        owner: transfer.to,
        quantity: transfer.quantity,
        collectionName: transfer.collectionName,
      },
    ])
    .filter(
      (transfer) =>
        transfer.owner !== '0x0000000000000000000000000000000000000000',
    );
}
