import { Types } from 'indexer-utils';

export interface LogWithTransfers extends Types.Archive.Log {
  associatedLogs: AssociatedLogs;
  // transfers721: Types.Nft.ERC721TokenTransfer[];
  // transfers1155: Types.Nft.ERC1155TokenTransfer[];
  // transfers20: Types.Erc20.Transfer[];
}

export type ExtractedNFTPriceData = {
  openseaLogs: LogWithTransfers[];
  associatedContracts: AssociatedContracts;
};

export type TransformedNFTPriceData = {
  sales: Types.Nft.Sale[];
  missingContracts: MissingContracts[];
  mismatchedTransfers: MismatchedTransfers[];
};

export type MissingContracts = {
  _id: string;
};

export type MismatchedTransfers = {
  _id: string;
};

export type AssociatedLogs = {
  erc20: Types.Archive.Log[];
  erc721: Types.Archive.Log[];
  erc1155Single: Types.Archive.Log[];
  erc1155Batch: Types.Archive.Log[];
};

export type AssociatedContracts = {
  erc20: Types.Contract.ERC20Contract[];
  erc721: Types.Contract.ERC721Contract[];
  erc1155: Types.Contract.ERC1155Contract[];
};

export type TokenTransfer = {
  contract: string;
  to: string;
  from: string;
  amount: string;
};

export type NftTransfer = {
  _id: string;
  to: string;
  from: string;
  tokenId: string;
  quantity?: string;
  contract: string;
  transactionId: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
};
