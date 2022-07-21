export type Transfer = {
  _id: string;
  contract: string;
  from: string;
  to: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  amount: string;
  name?: string;
  symbol?: string;
  decimals?: number;
};

export type Balance = {
  amount: string;
  amountFormatted?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
};
