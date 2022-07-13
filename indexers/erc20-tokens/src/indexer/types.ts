import { Types } from 'indexer-utils';

export type ExtractedData = {
  transferLogs: Types.Archive.Log[];
  erc20Contracts: Types.Contract.ERC20Contract[];
};
