import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { filter } from 'archive-utils';
import ERC20TransactionModel from './erc20-transaction';

const ERC20TransactionTC = composeMongoose(ERC20TransactionModel);

schemaComposer.Query.addFields({
  erc20TransactionById: ERC20TransactionTC.mongooseResolvers.findById(filter),
  erc20Transaction: ERC20TransactionTC.mongooseResolvers.findOne(filter),
  erc20Transactions: ERC20TransactionTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();
export { ERC20TransactionModel };
