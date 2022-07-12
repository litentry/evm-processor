import { Types } from 'indexer-utils';

export type ExtractedNFTData = {
  erc721TransferLogs: Types.Archive.Log[];
  erc1155TransferSingleLogs: Types.Archive.Log[];
  erc1155TransferBatchLogs: Types.Archive.Log[];
  erc721Contracts: Types.Contract.ERC721Contract[];
  erc1155Contracts: Types.Contract.ERC1155Contract[];
};

export type TransformedNFTData = {
  erc721Tokens: Types.Nft.ERC721Token[];
  erc1155Tokens: Types.Nft.ERC1155Token[];
  erc721TokenTransfers: Types.Nft.ERC721TokenTransfer[];
  erc1155TokenTransfers: Types.Nft.ERC1155TokenTransfer[];
};
