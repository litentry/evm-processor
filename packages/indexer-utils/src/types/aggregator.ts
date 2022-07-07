export interface BaseAggregator {
  lastAggregatedBlockNumber: number;
  lastAggregatedAt: Date;
}

export interface MarketActivity {
  totalTransactions: number;
  // totalAmount: number;
  // totalGas: number;
}

/**
 * ERC 721
 */
export interface ERC721YearlyMarketActivity extends MarketActivity {
  year: number;
}
export interface ERC721MonthlyMarketActivity
  extends ERC721YearlyMarketActivity {
  month: number;
}
export interface ERC721DailyMarketActivity extends ERC721MonthlyMarketActivity {
  day: number;
}

/**
 * ERC 1155
 */
export interface ERC1155YearlyMarketActivity extends MarketActivity {
  year: number;
}
export interface ERC1155MonthlyMarketActivity
  extends ERC1155YearlyMarketActivity {
  month: number;
}
export interface ERC1155DailyMarketActivity
  extends ERC1155MonthlyMarketActivity {
  day: number;
}
