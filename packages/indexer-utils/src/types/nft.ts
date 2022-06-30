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
  quantity: number;
  collectionName?: string;
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
  transactionId: string;
}

export interface ERC1155TokenTransfer {
  _id: string;
  from: string;
  to: string;
  contract: string;
  tokenId: string;
  quantity: number;
  collectionName?: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  transactionId: string;
}
