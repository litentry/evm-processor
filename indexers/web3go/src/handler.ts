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
  DecodedContractEvent,
  DecodedContractTransaction,
  ERC1155Contract,
  ERC20Contract,
  ERC721Contract,
} from 'indexer-utils/lib/types/contract';
import { isString } from 'lodash';

export default function getHandler(client: Client) {
  // function toInsertRow(data: any, fields: string[]) {
  //   return Object
  //     .entries(data)
  //     .filter(([key, value]) => {
  //       if (fields.indexOf(key) !== -1) {
  //         return true;
  //       }
  //     })
  //     .map(([key, value]) => value);
  // }

  async function q(sql: string) {
    try {
      await client.query(sql);
    } catch (e) {
      console.log(`Error in sql: ${sql}`);
      throw e;
    }
  }

  function wrap(data: any): any {
    if (isString(data)) {
      return client.escapeLiteral(data);
    }
    return data;
  }

  return async function handler(startBlock: number, endBlock: number) {
    // required to match the allowed ERC contract types
    const ercTypes = <(20 | 721 | 1155)[]>[20, 721, 1155];

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
          ${wrap(block.number)},
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
        )`
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
        )`
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
          ${wrap(tx.hash)},
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
        )`
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
          ${wrap(tx.hash)},
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
        )`
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
          'hash',
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
          ${wrap(tx.hash)},
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
        )`
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
      const transactions = await query.tokenContracts.erc20Contracts({
        blockRange: {
          start: startBlock,
          end: endBlock,
        },
        properties: [
          'address',
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
          ${wrap(tx.address)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.symbol)},
          ${wrap(tx.name)},
          ${wrap(tx.decimals)},
          ${wrap(tx.erc165)}
        )`
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
      const transactions = await query.tokenContracts.erc721Contracts({
        blockRange: {
          start: startBlock,
          end: endBlock,
        },
        properties: [
          'address',
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
          ${wrap(tx.address)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.name)},
          ${wrap(tx.erc165)},
          ${wrap(tx.erc721TokenReceiver)},
          ${wrap(tx.erc721Metadata)},
          ${wrap(tx.erc721Enumerable)}
        )`
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
      const transactions = await query.tokenContracts.erc1155Contracts({
        blockRange: {
          start: startBlock,
          end: endBlock,
        },
        properties: [
          'address',
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
          ${wrap(tx.address)},
          ${wrap(tx.creator)},
          ${wrap(tx.blockNumber)},
          to_timestamp(${wrap(tx.timestamp)}),
          ${wrap(tx.name)},
          ${wrap(tx.erc165)},
          ${wrap(tx.erc1155TokenReceiver)},
          ${wrap(tx.erc1155MetadataURI)}
        )`
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

    async function allTokenActivityEvents() {
      for (const ercType of ercTypes) {
        const events: DecodedContractEvent[] = await query.tokenActivity.events(
          {
            blockRange: {
              start: startBlock,
              end: endBlock,
            },
            ercType,
          }
        );

        if (!events.length) {
          return;
        }

        const querySql = events
          .map(
            (event: DecodedContractEvent) => `(
          ${wrap(event.contract)},
          ${wrap(event.transactionHash)},
          ${wrap(event.signature)},
          ${wrap(event.blockNumber)},
          to_timestamp(${wrap(event.blockTimestamp)}),
          ${wrap(event.value1)},
          ${wrap(event.value2)},
          ${wrap(event.value3)},
          ${wrap(event.value4)},
          ${wrap(event.type1)},
          ${wrap(event.type2)},
          ${wrap(event.type3)},
          ${wrap(event.type4)}
        )`
          )
          .join(',');

        const sql = `INSERT INTO evm_token_activity_event_erc${ercType} (
            contract,
            transactionHash,
            signature,
            blockNumber,
            blockTimestamp,
            value1,
            value2,
            value3,
            value4,
            type1,
            type2,
            type3,
            type4
          )
          VALUES ${querySql}`;

        await q(sql);
      }
    }

    async function allTokenActivityTransactions() {
      for (const ercType of ercTypes) {
        const transactions: DecodedContractTransaction[] =
          await query.tokenActivity.transactions({
            blockRange: {
              start: startBlock,
              end: endBlock,
            },
            ercType,
          });

        if (!transactions.length) {
          return;
        }

        const querySql = transactions
          .map(
            (tx: DecodedContractTransaction) => `(
            ${wrap(tx.hash)},
            ${wrap(tx.contract)},
            ${wrap(tx.signer)},
            ${wrap(tx.signature)},
            ${wrap(tx.blockNumber)},
            to_timestamp(${wrap(tx.blockTimestamp)}),
            ${wrap(tx.value1)},
            ${wrap(tx.value2)},
            ${wrap(tx.value3)},
            ${wrap(tx.value4)},
            ${wrap(tx.value5)},
            ${wrap(tx.value6)},
            ${wrap(tx.type1)},
            ${wrap(tx.type2)},
            ${wrap(tx.type3)},
            ${wrap(tx.type4)},
            ${wrap(tx.type5)},
            ${wrap(tx.type6)}
          )`
          )
          .join(',');

        const sql = `INSERT INTO evm_token_activity_transaction_erc${ercType} (
            hash,
            contract,
            signer,
            signature,
            blockNumber,
            blockTimestamp,
            value1,
            value2,
            value3,
            value4,
            value5,
            value6,
            type1,
            type2,
            type3,
            type4,
            type5,
            type6
          )
          VALUES ${querySql}`;

        await q(sql);
      }
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

      await allTokenActivityEvents();
      await allTokenActivityTransactions();
    });
  };
}
