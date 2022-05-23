import { schemaComposer } from 'graphql-compose';
import { blockQuery, BlockModel } from './block';
import { LastIndexedBlockModel } from './last-indexed-block';
import { LastQueuedBlockModel } from './last-queued-block';
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
  LastIndexedBlockModel,
  LastQueuedBlockModel,
};

export default schemaComposer.buildSchema();
