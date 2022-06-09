export interface ERC721Token {
  contract: string;
  tokenId: string;
  owner: string;
  lastTransferedBlockNumber: number;
  lastTransferedBlockTimestamp: number;
}

export interface ERC1155Token {
  contract: string;
  tokenId: string;
  owner: string;
  quantity: number;
}
