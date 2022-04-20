import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from './schema';
import { LoadBlock } from './types';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const mongo: LoadBlock = async ({
  nativeTokenTransactions,
  contractCreationTransactions,
  contractTransactions,
  logs,
  block,
}) => {
  try {
    await Promise.all([
      BlockModel.create(block),
      NativeTokenTransactionModel.insertMany(nativeTokenTransactions),
      ContractCreationTransactionModel.insertMany(contractCreationTransactions),
      ContractTransactionModel.insertMany(contractTransactions),
      LogModel.insertMany(logs),
    ]);
  } catch (e) {
    console.error(e);
    console.log(`Cleaning up block ${block.number}`);

    try {
      const filter = {
        blockNumber: block.number,
      };
      await BlockModel.deleteOne({ block: block.number });
      await NativeTokenTransactionModel.deleteMany(filter);
      await ContractCreationTransactionModel.deleteMany(filter);
      await ContractTransactionModel.deleteMany(filter);
      await LogModel.deleteMany(filter);
    } catch (e) {
      console.error(e);
      console.error(`Clean up failed for block ${block.number}`);
    }
  }
};

export default mongo;