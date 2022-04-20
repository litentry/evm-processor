export enum ContractType {
  ERC165 = 'ERC165',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export type ContractSignatureItem = {
  SIGNATURE: string;
  ID: string;
  _ID: string;
  PARAMS: string[];
  REQUIRED: boolean;
};

export interface ERC20Contract {
  address: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  symbol?: string;
  name?: string;
  decimals?: number;

  erc165: boolean;
}

export interface ERC721Contract {
  address: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  name?: string;

  erc165: boolean;
  erc721TokenReceiver: boolean;
  erc721Metadata: boolean;
  erc721Enumerable: boolean;
}

export interface ERC1155Contract {
  address: string; // address
  creator: string;
  blockNumber: number;
  timestamp: number;

  name?: string;

  erc165: boolean;
  erc1155TokenReceiver: boolean;
  erc1155MetadataURI: boolean;
}

export interface DecodedContractTransaction {
  hash: string; // hash
  contract: string;
  signer: string;
  signature: string;
  blockNumber: number;
  blockTimestamp: number;
  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  value5?: string;
  value6?: string;
  type1?: string;
  type2?: string;
  type3?: string;
  type4?: string;
  type5?: string;
  type6?: string;
}

export interface DecodedContractEvent {
  contract: string;
  transactionHash: string;
  signature: string;
  blockNumber: number;
  blockTimestamp: number;
  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  type1?: string;
  type2?: string;
  type3?: string;
  type4?: string;
}
