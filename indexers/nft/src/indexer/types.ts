import { Types } from 'indexer-utils';

export type ExtractedData = {
  erc721TransferEvents: Types.Archive.Log[];
  erc1155TransferSingleEvents: Types.Archive.Log[];
  erc1155TransferBatchEvents: Types.Archive.Log[];
  erc721Contracts: Types.Contract.ERC721Contract[];
  erc1155Contracts: Types.Contract.ERC1155Contract[];
};

export type TransformedData = {
  erc721Tokens: Types.Nft.ERC721Token[];
  erc1155Tokens: Types.Nft.ERC1155Token[];
  erc721TokenTransfers: Types.Nft.ERC721TokenTransfer[];
  erc1155TokenTransfers: Types.Nft.ERC1155TokenTransfer[];
};
