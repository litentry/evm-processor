import mongoose from 'mongoose';

export {
  BlockModel,
  ContractSignatureModel,
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
} from './models';

export {
  NativeTokenTransaction,
  ContractCreationTransaction,
  ContractTransaction,
  Log,
  ContractSignature,
  Block,
  TransactionBase,
  TransactionType,
  Transaction,
} from './types';

export const connect = async (mongoUri: string) => mongoose.connect(mongoUri);
