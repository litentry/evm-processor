import { Client } from "pg";

export async function createSchema(client: Client) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_blocks (
      number bigint PRIMARY KEY,
      hash varchar(100),
      parentHash varchar(100),
      nonce varchar(100),
      sha3Uncles varchar(100),
      transactionRoot varchar(100),
      stateRoot varchar(100),
      miner varchar(100),
      extraData varchar(100),
      gasLimit bigint,
      gasUsed bigint,
      timestamp timestamp(6),
      size bigint,
      difficulty varchar(100),
      totalDifficulty varchar(100),
      uncles varchar(100)
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_logs (
      id varchar(100) PRIMARY KEY,
      blockNumber bigint,
      logIndex bigint,
      blockTimestamp timestamp(6),
      transactionHash varchar(100),
      address varchar(100),
      topic0 varchar(100),
      topic1 varchar(100),
      topic2 varchar(100),
      topic3 varchar(100),
      topic4 varchar(100),
      data text
    ) `
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_contract_creation_transactions (    
      id varchar(100) PRIMARY KEY,
      hash varchar(100),
      nonce varchar(100),
      blockHash varchar(100),
      blockNumber bigint,
      blockTimestamp timestamp(6),
      transactionIndex bigint,
      "from" varchar(100),
      value varchar(100),
      gasPrice bigint,
      gas bigint,
      receiptStatus boolean,
      receiptCumulativeGasUsed bigint,
      receiptGasUsed bigint,
      input text,
      methodId varchar(100),
      receiptContractAddress varchar(100)
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_native_token_transactions (    
      id varchar(100) PRIMARY KEY,
      hash varchar(100),
      nonce varchar(100),
      blockHash varchar(100),
      blockNumber bigint,
      blockTimestamp timestamp(6),
      transactionIndex bigint,
      "from" varchar(100),
      value varchar(100),
      gasPrice bigint,
      gas bigint,
      receiptStatus boolean,
      receiptCumulativeGasUsed bigint,
      receiptGasUsed bigint,
      "to" varchar(100)
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_contract_transactions (    
      id varchar(100) PRIMARY KEY,
      hash varchar(100),
      nonce varchar(100),
      blockHash varchar(100),
      blockNumber bigint,
      blockTimestamp timestamp(6),
      transactionIndex bigint,
      "from" varchar(100),
      value varchar(100),
      gasPrice bigint,
      gas bigint,
      receiptStatus boolean,
      receiptCumulativeGasUsed bigint,
      receiptGasUsed bigint,
      "to" varchar(100),
      input text,
      methodId varchar(100)
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_contracts_erc20 (
      address varchar(100) PRIMARY KEY,
      creator varchar(100),
      blockNumber bigint,
      timestamp timestamp(6),
      symbol varchar(100),
      name varchar(100),
      decimals varchar(100),
      erc165 boolean
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_contracts_erc721 (
      address varchar(100) PRIMARY KEY,
      creator varchar(100),
      blockNumber bigint,
      timestamp timestamp(6),
      symbol varchar(100),
      name varchar(100),
      decimals varchar(100),
      erc165 boolean,
      erc721TokenReceiver boolean,
      erc721Metadata boolean,
      erc721Enumerable boolean
    )`
  );

  await client.query(
    `CREATE TABLE IF NOT EXISTS evm_contracts_erc1155 (
      address varchar(100) PRIMARY KEY,
      creator varchar(100),
      blockNumber bigint,
      timestamp timestamp(6),
      symbol varchar(100),
      name varchar(100),
      decimals varchar(100),
      erc165 boolean,
      erc1155TokenReceiver boolean,
      erc1155MetadataURI boolean
    )`
  );

  for (const ercType of [20, 721, 1155]) {
    await client.query(
      `CREATE TABLE IF NOT EXISTS evm_token_activity_event_erc${ercType} (
        id SERIAL PRIMARY KEY,    
        contract varchar(100),
        transactionHash varchar(100),
        signature varchar(100),
        blockNumber bigint,
        blockTimestamp timestamp(6),
        value1 varchar(100),
        value2 varchar(100),
        value3 varchar(100),
        value4 varchar(100),
        type1 varchar(100),
        type2 varchar(100),
        type3 varchar(100),
        type4 varchar(100)
      )`
    );

    await client.query(
      `CREATE TABLE IF NOT EXISTS evm_token_activity_transaction_erc${ercType} (
        id SERIAL PRIMARY KEY,    
        hash varchar(100),
        contract varchar(100),
        signer varchar(100),
        signature varchar(100),
        blockNumber bigint,
        blockTimestamp timestamp(6),
        value1 varchar(100),
        value2 varchar(100),
        value3 varchar(100),
        value4 varchar(100),
        value5 varchar(100),
        value6 varchar(100),
        type1 varchar(100),
        type2 varchar(100),
        type3 varchar(100),
        type4 varchar(100),
        type5 varchar(100),
        type6 varchar(100)
      )`
    );
  }
}

export default createSchema;