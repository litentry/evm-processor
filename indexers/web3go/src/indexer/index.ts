import { query } from 'indexer-utils';
import { Client } from 'pg';
import {
  Block,
  ContractCreationTransaction,
  ContractTransaction,
  Log,
  NativeTokenTransaction,
} from 'indexer-utils/lib/types/archive';
import {
  ERC1155Contract,
  ERC20Contract,
  ERC721Contract,
} from 'indexer-utils/lib/types/contract';
import { isString } from 'lodash';
import createSchema from './create-schema';

const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

export default async function indexer(startBlock: number, endBlock: number) {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
  });
  await client.connect();
  await createSchema(client);

  const q = async (sql: string) => {
    try {
      await client.query(sql);
    } catch (e) {
      console.log(`Error in sql: ${sql}`);
      throw e;
    }
  };

  const wrap = (data: any): any => {
    if (isString(data)) {
      return client.escapeLiteral(data);
    }
    return data;
  };

  async function inTransaction(fn: () => Promise<void>) {
    await client.query('START TRANSACTION');
    await fn();
    await client.query('COMMIT');
  }

  async function blocks() {
    const blocks = await query.archive.blocks({
      startBlock,
      endBlock,
    });

    const querySql = blocks
      .map(
        (block: Block) => `(
          ${wrap(block._id)},
          ${wrap(block.hash)},
          ${wrap(block.parentHash)},
          ${wrap(block.nonce)},
          ${wrap(block.sha3Uncles)},
          ${wrap(block.transactionRoot)},
          ${wrap(block.stateRoot)},
          ${wrap(block.miner)},
          ${wrap(block.extraData)},
          ${wrap(block.gasLimit)},
          ${wrap(block.gasUsed)},
          to_timestamp(${wrap(block.timestamp)}),
          ${wrap(block.size)},
          ${wrap(block.difficulty)},
          ${wrap(block.totalDifficulty)},
          ${wrap(block.uncles)}
        )`,
      )
      .join(', ');

    const sql = `INSERT INTO evm_blocks (
          number,
          hash,
          parentHash,
          nonce,
          sha3Uncles,
          transactionRoot,
          stateRoot,
          miner,
          extraData,
          gasLimit,
          gasUsed,
          timestamp,
          size,
          difficulty,
          totalDifficulty,
          uncles
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function logs() {
    const logs = await query.archive.logs({
      startBlock,
      endBlock,
    });

    if (!logs.length) {
      return;
    }

    const querySql = logs
      .map(
        (log: Log) => `(
          ${wrap(`${log.blockNumber}-${log.logIndex}`)},
          ${wrap(log.blockNumber)},
          to_timestamp(${wrap(log.blockTimestamp)}),
          ${wrap(log.transactionHash)},
          ${wrap(log.address)},
          ${wrap(log.topic0)},
          ${wrap(log.topic1)},
          ${wrap(log.topic2)},
          ${wrap(log.topic3)},
          ${wrap(log.topic4)},
          ${wrap(log.data)},
          ${wrap(log.logIndex)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_logs (
          id,
          blockNumber,
          blockTimestamp,
          transactionHash,
          address,
          topic0,
          topic1,
          topic2,
          topic3,
          topic4,
          data,
          logIndex
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function contractCreationTransactions() {
    const transaactions = await query.archive.contractCreationTransactions({
      startBlock,
      endBlock,
    });

    if (!transaactions.length) {
      return;
    }

    const querySql = transaactions
      .map(
        (tx: ContractCreationTransaction) => `(
          ${wrap(`${tx.blockNumber}-${tx.transactionIndex}`)},
          ${wrap(tx._id)},
          ${wrap(tx.nonce)},
          ${wrap(tx.blockHash)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.blockTimestamp)}),
          ${wrap(tx.transactionIndex)},
          ${wrap(tx.from)},
          ${wrap(tx.value)},
          ${wrap(tx.gasPrice)},
          ${wrap(tx.gas)},
          ${wrap(tx.receiptStatus)},
          ${wrap(tx.receiptCumulativeGasUsed)},
          ${wrap(tx.receiptGasUsed)},
          ${wrap(tx.input)},
          ${wrap(tx.methodId)},
          ${wrap(tx.receiptContractAddress)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_contract_creation_transactions (
          id,
          hash,
          nonce,
          blockHash,
          blockNumber,
          blockTimestamp,
          transactionIndex,
          "from",
          value,
          gasPrice,
          gas,
          receiptStatus,
          receiptCumulativeGasUsed,
          receiptGasUsed,
          input,
          methodId,
          receiptContractAddress
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function contractTransactions() {
    const transactions = await query.archive.contractTransactions({
      startBlock,
      endBlock,
    });

    if (!transactions.length) {
      return;
    }

    const querySql = transactions
      .map(
        (tx: ContractTransaction) => `(
          ${wrap(`${tx.blockNumber}-${tx.transactionIndex}`)},
          ${wrap(tx._id)},
          ${wrap(tx.nonce)},
          ${wrap(tx.blockHash)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.blockTimestamp)}),
          ${wrap(tx.transactionIndex)},
          ${wrap(tx.from)},
          ${wrap(tx.value)},
          ${wrap(tx.gasPrice)},
          ${wrap(tx.gas)},
          ${wrap(tx.receiptStatus)},
          ${wrap(tx.receiptCumulativeGasUsed)},
          ${wrap(tx.receiptGasUsed)},
          ${wrap(tx.to)},
          ${wrap(tx.input)},
          ${wrap(tx.methodId)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_contract_transactions (
          id,
          hash,
          nonce,
          blockHash,
          blockNumber,
          blockTimestamp,
          transactionIndex,
          "from",
          value,
          gasPrice,
          gas,
          receiptStatus,
          receiptCumulativeGasUsed,
          receiptGasUsed,
          "to",
          input,
          methodId
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function nativeTokenTransactions() {
    const transactions = await query.archive.nativeTokenTransactions({
      startBlock,
      endBlock,
      properties: [
        '_id',
        'nonce',
        'blockHash',
        'blockNumber',
        'blockTimestamp',
        'transactionIndex',
        'from',
        'value',
        'gasPrice',
        'gas',
        'receiptStatus',
        'receiptCumulativeGasUsed',
        'receiptGasUsed',
        'to',
      ],
    });

    if (!transactions.length) {
      return;
    }

    const querySql = transactions
      .map(
        (tx: NativeTokenTransaction) => `(
          ${wrap(`${tx.blockNumber}-${tx.transactionIndex}`)},
          ${wrap(tx._id)},
          ${wrap(tx.nonce)},
          ${wrap(tx.blockHash)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.blockTimestamp)}),
          ${wrap(tx.transactionIndex)},
          ${wrap(tx.from)},
          ${wrap(tx.value)},
          ${wrap(tx.gasPrice)},
          ${wrap(tx.gas)},
          ${wrap(tx.receiptStatus)},
          ${wrap(tx.receiptCumulativeGasUsed)},
          ${wrap(tx.receiptGasUsed)},
          ${wrap(tx.to)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_native_token_transactions (
          id,
          hash,
          nonce,
          blockHash,
          blockNumber,
          blockTimestamp,
          transactionIndex,
          "from",
          value,
          gasPrice,
          gas,
          receiptStatus,
          receiptCumulativeGasUsed,
          receiptGasUsed,
          "to"
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function erc20Contracts() {
    const transactions = await query.contracts.erc20Contracts({
      blockRange: {
        start: startBlock,
        end: endBlock,
      },
      properties: [
        '_id',
        'creator',
        'blockNumber',
        'timestamp',
        'symbol',
        'name',
        'decimals',
        'erc165',
      ],
    });

    if (!transactions.length) {
      return;
    }

    const querySql = transactions
      .map(
        (tx: ERC20Contract) => `(
          ${wrap(tx._id)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.symbol)},
          ${wrap(tx.name)},
          ${wrap(tx.decimals)},
          ${wrap(tx.erc165)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_contracts_erc20 (
          address,
          creator,
          blockNumber,
          timestamp,
          symbol,
          name,
          decimals,
          erc165
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function erc721Contracts() {
    const transactions = await query.contracts.erc721Contracts({
      blockRange: {
        start: startBlock,
        end: endBlock,
      },
      properties: [
        '_id',
        'creator',
        'blockNumber',
        'timestamp',
        'name',
        'erc165',
        'erc721TokenReceiver',
        'erc721Metadata',
        'erc721Enumerable',
      ],
    });

    if (!transactions.length) {
      return;
    }

    const querySql = transactions
      .map(
        (tx: ERC721Contract) => `(
          ${wrap(tx._id)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.name)},
          ${wrap(tx.erc165)},
          ${wrap(tx.erc721TokenReceiver)},
          ${wrap(tx.erc721Metadata)},
          ${wrap(tx.erc721Enumerable)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_contracts_erc721 (
          address,
          creator,
          blockNumber,
          timestamp,
          name,
          erc165,
          erc721TokenReceiver,
          erc721Metadata,
          erc721Enumerable
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  async function erc1155Contracts() {
    const transactions = await query.contracts.erc1155Contracts({
      blockRange: {
        start: startBlock,
        end: endBlock,
      },
      properties: [
        '_id',
        'creator',
        'blockNumber',
        'timestamp',
        'name',
        'erc165',
        'erc1155TokenReceiver',
        'erc1155MetadataURI',
      ],
    });

    if (!transactions.length) {
      return;
    }

    const querySql = transactions
      .map(
        (tx: ERC1155Contract) => `(
          ${wrap(tx._id)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.name)},
          ${wrap(tx.erc165)},
          ${wrap(tx.erc1155TokenReceiver)},
          ${wrap(tx.erc1155MetadataURI)}
        )`,
      )
      .join(',');

    const sql = `INSERT INTO evm_contracts_erc1155 (
          address,
          creator,
          blockNumber,
          timestamp,
          name,
          erc165,
          erc1155TokenReceiver,
          erc1155MetadataURI
        )
        VALUES ${querySql}`;

    await q(sql);
  }

  await inTransaction(async () => {
    await blocks();
    await logs();
    await contractCreationTransactions();
    await contractTransactions();
    await nativeTokenTransactions();

    await erc20Contracts();
    await erc721Contracts();
    await erc1155Contracts();
  });
}
