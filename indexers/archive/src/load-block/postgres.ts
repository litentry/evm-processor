// import {
//   BlockModel,
//   ContractSignatureModel,
//   LogModel,
//   TransactionModel,
// } from '../postgres-models';
import { LoadBlock } from '../types';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const postgres: LoadBlock = async ({ contractTransactions, logs, block }) => {
  try {
    // await Promise.all([
    //   BlockModel.create(block as any),
    //   TransactionModel.bulkCreate(contractTransactions as any),
    //   LogModel.bulkCreate(logs as any),
    //   ContractSignatureModel.bulkCreate(contractSignatures as any),
    // ]);
  } catch (e) {
    console.error(e);
    console.log(`Cleaning up block ${block.number}`);

    try {
      const filter = {
        blockNumber: block.number,
      };
      // await BlockModel.destroy({ where: { block: block.number } });
      // await TransactionModel.destroy({ where: filter });
      // await LogModel.destroy({ where: filter });
      // await ContractSignatureModel.destroy({ where: filter });
    } catch (e) {
      console.error(e);
      console.error(`Clean up failed for block ${block.number}`);
    }
  }
};

export default postgres;
