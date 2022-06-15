export enum SwapMethod {
  swapTokensForExactETH = 'swapTokensForExactETH',
  swapExactETHForTokens = 'swapExactETHForTokens',
  swapTokensForExactTokens = 'swapTokensForExactTokens',
  swapExactTokensForTokens = 'swapExactTokensForTokens',
  swapExactTokensForETH = 'swapExactTokensForETH',
  swapETHForExactTokens = 'swapETHForExactTokens',
}

export type Swap = {
  transactionHash: string; // index
  address: string; // index
  contract: string; // index
  pair: string; // index "tokenAddress:tokenAddress"

  method: SwapMethod;
  token0: string;
  token1: string;
  token0Amount: string;
  token1Amount: string;
  intermediatePath?: string;
  deadline: string;
  gas: string;
  blockNumber: number;
  timestamp: number;
};
