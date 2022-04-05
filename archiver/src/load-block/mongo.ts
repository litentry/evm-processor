import { ContractSignatureModel, LogModel, TransactionModel } from '../models';
import { LoadBlock } from '../types';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const mongo: LoadBlock = async ({ transactions, logs, contractSignatures }) => {
  try {
    await Promise.all([
      TransactionModel.insertMany(transactions),
      LogModel.insertMany(logs),
      ContractSignatureModel.insertMany(contractSignatures),
    ]);
  } catch (e) {
    console.error(e);

    const blocks = transactions.map((tx) => tx.blockNumber).sort();
    const filter = {
      blockNumber: { $lte: blocks[0], $gte: blocks[blocks.length - 1] },
    };

    console.log(
      `Cleaning up blocks between ${blocks[0]} and ${blocks[blocks.length - 1]}`
    );

    try {
      await TransactionModel.deleteMany(filter);
      await LogModel.deleteMany(filter);
      await ContractSignatureModel.deleteMany(filter);
    } catch (e) {
      console.error(e);
      console.error(
        `Clean up failed for blocks between ${blocks[0]} and ${
          blocks[blocks.length - 1]
        }`
      );
    }
  }
};

export default mongo;
