import {
  ContractSignatureModel,
  LogModel,
  TransactionModel,
  BlockModel,
} from '../models';
import { LoadBlock } from '../types';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const mongo: LoadBlock = async ({
  transactions,
  logs,
  contractSignatures,
  block,
}) => {
  try {
    await Promise.all([
      BlockModel.create(block),
      TransactionModel.insertMany(transactions),
      LogModel.insertMany(logs),
      ContractSignatureModel.insertMany(contractSignatures),
    ]);
  } catch (e) {
    console.error(e);
    console.log(`Cleaning up block ${block.number}`);

    try {
      const filter = {
        blockNumber: block.number,
      };
      await BlockModel.deleteOne({ block: block.number });
      await TransactionModel.deleteMany(filter);
      await LogModel.deleteMany(filter);
      await ContractSignatureModel.deleteMany(filter);
    } catch (e) {
      console.error(e);
      console.error(`Clean up failed for block ${block.number}`);
    }
  }
};

export default mongo;
