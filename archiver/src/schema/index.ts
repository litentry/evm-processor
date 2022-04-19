import { schemaComposer } from 'graphql-compose';
import { blockQuery, BlockModel } from './block';
import { logQuery, LogModel } from './log';
import {
  transactionQuery,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  NativeTokenTransactionModel,
} from './transaction';

schemaComposer.Query.addFields({
  ...blockQuery,
  ...logQuery,
  ...transactionQuery,
});

export {
  BlockModel,
  LogModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  NativeTokenTransactionModel,
};

export default schemaComposer.buildSchema();
