export type Config = {
  mongoUri: string;
  port: number;
  maxBlockRange: {
    blocks: number;
    contractCreationTransactions: number;
    contractTransactions: number;
    nativeTokenTransactions: number;
    logs: number;
    contractTransactionsWithLogs: number;
  };
};

if (!process.env.MONGO_URI) {
  throw new Error(`process.env.MONGO_URI required`);
}

const config: Config = {
  mongoUri: process.env.MONGO_URI,
  port: parseInt(process.env.PORT || '4050'),
  // this is a bit minging, but we do want to stop people querying a terabyte of data... and we do need it to be configurable as ethereum mainnet is quite a lot busier than some other networks
  maxBlockRange: {
    blocks: parseInt(process.env.MAX_RANGE_BLOCKS || '1000'),
    contractCreationTransactions: parseInt(
      process.env.MAX_RANGE_CONTRACT_CREATION_TRANSACTIONS || '500'
    ),
    contractTransactions: parseInt(
      process.env.MAX_RANGE_CONTRACT_TRANSACTIONS || '500'
    ),
    nativeTokenTransactions: parseInt(
      process.env.MAX_RANGE_NATIVE_TOKEN_TRANSACTIONS || '500'
    ),
    logs: parseInt(process.env.MAX_RANGE_LOGS || '500'),
    contractTransactionsWithLogs: parseInt(
      process.env.MAX_RANGE_CONTRACT_TRANSACTIONS_WITH_LOGS || '200'
    ),
  },
};

export default config;
