import { Document } from 'mongoose';

export enum ContractType {
  ERC165 = 'ERC165',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export interface ERC20Contract extends Document {
  _id: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  symbol?: string;
  name?: string;
  decimals?: number;

  erc165: boolean;
}

export interface ERC721Contract extends Document {
  _id: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  name?: string;

  erc165: boolean;
  erc721TokenReceiver: boolean;
  erc721Metadata: boolean;
  erc721Enumerable: boolean;
}

export interface ERC1155Contract extends Document {
  _id: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  name?: string;

  erc165: boolean;
  erc1155TokenReceiver: boolean;
  erc1155MetadataURI: boolean;
}

export interface ERC20Transaction extends Document {
  _id: string; // hash
  contract: string;
  signer: string;
  method: string;
  methodId: string;

  blockNumber: number;
  blockTimestamp: number;

  value: string;
  input: string;
  inputDecoded: string;
}
