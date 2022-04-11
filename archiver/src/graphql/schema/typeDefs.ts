export default /* GraphQL */ `
  type Query {
    latestBlock: Int

    blocks(startBlock: Int!, endBlock: Int!): [Block]!

    contractCreationTransactions(
      startBlock: Int!
      endBlock: Int!
      contractAddress: String
      withLogs: Boolean
    ): [ContractCreationTransaction]!

    contractTransactions(
      startBlock: Int!
      endBlock: Int!
      contractAddress: String
      methodId: String
    ): [ContractTransaction]!

    contractTransactionsWithLogs(
      startBlock: Int!
      endBlock: Int!
      contractAddress: String
      methodId: String
    ): [ContractTransactionWithLogs]!

    nativeTokenTransactions(
      startBlock: Int!
      endBlock: Int!
      from: String
      to: String
    ): [NativeTokenTransaction]!

    logs(
      startBlock: Int!
      endBlock: Int!
      transactionHash: String
      contractAddress: String
      eventId: String
    ): [Log]!
  }

  type Block {
    number: Int!
    hash: String!
    parentHash: String!
    nonce: String
    sha3Uncles: String!
    transactionRoot: String
    stateRoot: String!
    miner: String!
    extraData: String!
    gasLimit: Int!
    gasUsed: Int!
    timestamp: Int!
    size: Int!
    difficulty: String!
    totalDifficulty: String!
    uncles: String
  }

  type Log {
    blockNumber: Int!
    blockTimestamp: Int!
    transactionHash: String!
    address: String!
    topic0: String!
    topic1: String
    topic2: String
    topic3: String
    topic4: String
    data: String
    logIndex: Int!
  }

  type ContractCreationTransaction {
    hash: String!
    nonce: Int!
    blockHash: String!
    blockNumber: Int!
    blockTimestamp: Int!
    transactionIndex: Int!
    from: String!
    value: String!
    gasPrice: String!
    gas: Int!
    receiptStatus: Boolean
    receiptCumulativeGasUsed: Int!
    receiptGasUsed: Int!

    input: String!
    methodId: String!
    receiptContractAddress: String!
  }

  type ContractTransaction {
    hash: String!
    nonce: Int!
    blockHash: String!
    blockNumber: Int!
    blockTimestamp: Int!
    transactionIndex: Int!
    from: String!
    value: String!
    gasPrice: String!
    gas: Int!
    receiptStatus: Boolean
    receiptCumulativeGasUsed: Int!
    receiptGasUsed: Int!

    input: String!
    methodId: String!
    to: String!
  }

  type ContractTransactionWithLogs {
    hash: String!
    nonce: Int!
    blockHash: String!
    blockNumber: Int!
    blockTimestamp: Int!
    transactionIndex: Int!
    from: String!
    value: String!
    gasPrice: String!
    gas: Int!
    receiptStatus: Boolean
    receiptCumulativeGasUsed: Int!
    receiptGasUsed: Int!

    input: String!
    methodId: String!
    to: String!
    logs: [Log]!
  }

  type NativeTokenTransaction {
    hash: String!
    nonce: Int!
    blockHash: String!
    blockNumber: Int!
    blockTimestamp: Int!
    transactionIndex: Int!
    from: String!
    value: String!
    gasPrice: String!
    gas: Int!
    receiptStatus: Boolean
    receiptCumulativeGasUsed: Int!
    receiptGasUsed: Int!

    to: String!
  }
`;
