import 'dotenv/config';
import mongoose from 'mongoose';
import { graphqlServer, processor, query } from 'archive-utils';
import schema, { ERC20TransactionModel } from './schema';
import { port, start, end, batchSize, extrinsics } from './config';

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  processor(start, end, batchSize, async (startBlock, endBlock) => {
    const txs = await Promise.all(
      extrinsics.map(async (extrinsic) => {
        // todo: this is not handling the underscored version on _ID
        const txs = await query.contractTransactions(
          startBlock,
          endBlock,
          undefined,
          extrinsic.ID,
          [
            'hash',
            'blockNumber',
            'blockTimestamp',
            'to',
            'from',
            'methodId',
            'value',
            'input',
            'receiptStatus',
          ]
        );
        return txs;
      })
    );
    const uniqueContractAddresses = [...new Set(txs.flat().map((tx) => tx.to))];
    const erc20Contracts = await query.erc20Contracts({
      startBlock,
      endBlock,
      contractAddress: uniqueContractAddresses,
      properties: ['_id'],
    });
    const erc20ContractAddresses = erc20Contracts.map((c) => c._id);

    await Promise.all(
      extrinsics.map(async (ex, i) => {
        const erc20Txs = txs[i].filter((tx) =>
          erc20ContractAddresses.includes(tx.to)
        );

        if (erc20Txs.length) {
          console.log(`${ex.SIGNATURE}: ${erc20Txs.length}`);

          await ERC20TransactionModel.insertMany(
            erc20Txs.map((tx) => ({
              _id: tx.hash,
              contract: tx.to,
              signer: tx.from,
              method: ex.SIGNATURE,
              methodId: tx.methodId,
              value: tx.value,
              blockNumber: tx.blockNumber,
              blockTimestamp: tx.blockTimestamp,
              input: tx.input,
              inputDecoded: tx.input, // TODO
            }))
          );
        }
      })
    );
  });

  graphqlServer(schema, port);
})();
