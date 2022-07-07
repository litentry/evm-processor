export type MarketActivity = {
  year: number;
  month?: number;
  day?: number;
  totalTransactions: number;
  // totalAmount: number;
  // totalGas: number;
};

export type ExtractedData = {
  totalTransactions: number;
  // totalAmount: number;
  blockTimestamp: number;
};

export type ExtractedTransfers = {
  erc721: ExtractedData[];
  erc1155: ExtractedData[];
};

export type AggregatedTransfers = {
  yearly: MarketActivity[];
  monthly: MarketActivity[];
  daily: MarketActivity[];
};

export type TransformedTransfers = {
  erc721: AggregatedTransfers;
  erc1155: AggregatedTransfers;
};
