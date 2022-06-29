import { Types } from 'indexer-utils';

export interface ERC20Transfer extends ERC20Balance {
  _id: string;
  contract: string;
  from: string;
  to: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  transactionId: string;
}

export type ERC20Balance = {
  amount: string;
  amountFormatted?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
};

export type ExtractedData = {
  transferLogs: Types.Archive.Log[];
  erc20Contracts: Types.Contract.ERC20Contract[];
};
