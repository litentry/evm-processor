export type BaseAggregator = {
  lastAggregatedBlockNumber: number;
  lastAggregatedAt: Date;
};

export type ERC721MarketActivity = {};

export type ERC1155MarketActivity = {};

export type MarketActivity = {
  totalTransactions: number;
  totalPrice: number;
  // totalGas: number;
};
