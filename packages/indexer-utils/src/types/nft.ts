export interface ERC721Token {
  _id: string;
  contract: string;
  tokenId: string;
  owner: string;
  lastTransferedBlockNumber: number;
  lastTransferedBlockTimestamp: number;
  collectionName?: string;
}

export interface ERC1155Token {
  _id: string;
  contract: string;
  tokenId: string;
  owner: string;
  quantity: string;
  collectionName?: string;
  lockedUntil?: number;
}

export interface ERC721TokenTransfer {
  _id: string;
  from: string;
  to: string;
  contract: string;
  tokenId: string;
  collectionName?: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
}

export interface ERC1155TokenTransfer {
  _id: string;
  from: string;
  to: string;
  contract: string;
  tokenId: string;
  quantity: string;
  collectionName?: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
}

// one record per token transferred, not per sale event
export interface Sale {
  _id: string; // log ID of the transfer
  from: string;
  to: string;
  price: string;
  contract: string;
  tokenId: string;
  quantity?: string; // ERC1155
  collectionName?: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;

  // present if price not in ETH
  erc20Contract?: string;
  erc20Symbol?: string;
  erc20Name?: string;
  erc20Decimals?: number;
}
