import { schemaComposer } from 'graphql-compose';
import { repository } from 'indexer-utils';
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
  ...repository.lastIndexedBlock.query,
});

const LastIndexedBlockModel = repository.lastIndexedBlock.Model;

export {
  BlockModel,
  LogModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  NativeTokenTransactionModel,
  LastIndexedBlockModel,
};

export default schemaComposer.buildSchema();
