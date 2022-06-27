export interface ERC721Token {
  _id: string;
  contract: string;
  tokenId: string;
  owner: string;
  lastTransferedBlockNumber: number;
  lastTransferedBlockTimestamp: number;
}

export interface ERC1155Token {
  _id: string;
  contract: string;
  tokenId: string;
  owner: string;
  quantity: number;
}
