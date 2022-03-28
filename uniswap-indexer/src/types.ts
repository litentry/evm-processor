// todo @jeff these should come from codegen
export interface UniswapLPSwap {
  id: string;
  account: string;
  pair: string;
  // pairSymbol: string;
  intermediatePath: string | null;
  deadline: BigInt;

  token0: UniswapLPToken;
  token1: UniswapLPToken;
  token0Amount: BigInt;
  token1Amount: BigInt;

  gas: BigInt;
  blockNumber: BigInt;
  timestamp: Date;
  // timestamp: BigInt;
  transactionHash: string;
}

export interface UniswapLPToken {
  id: string;
  // symbol: string;
  // decimals: BigInt;
  // name: string;
}
