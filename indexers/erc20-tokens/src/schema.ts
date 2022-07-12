import BN from 'bignumber.js';
import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { filter, query, repository, web3 } from 'indexer-utils';
import mongoose from 'mongoose';
import Web3 from 'web3';
import { ERC20Balance, ERC20Transfer } from './indexer/types';

// @ts-ignore
interface ERC20TransferDocument extends ERC20Transfer, mongoose.Document {}

export const ERC20TransferSchema = new mongoose.Schema<ERC20TransferDocument>({
  _id: String,
  contract: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: String, required: true },
  name: String,
  symbol: String,
  decimals: Number,
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  transactionHash: { type: String, required: true },
  transactionId: { type: String, required: true },
});

ERC20TransferSchema.index({ contract: 1 });
ERC20TransferSchema.index({ from: 1 });
ERC20TransferSchema.index({ to: 1 });
ERC20TransferSchema.index({ transactionId: 1 });

export const ERC20TransferModel = mongoose.model(
  'ERC20Transfer',
  ERC20TransferSchema,
);

const ERC20TransferTC = composeMongoose(ERC20TransferModel);

schemaComposer.Query.addFields({
  erc20LatestBlock: repository.lastIndexedBlock.query.latestBlock,
  erc20Transfers: ERC20TransferTC.mongooseResolvers.findMany(filter),
  erc20Balance: {
    type: `type ERC20Balance {
      amount: String,
      amountFormatted: String,
      name: String,
      symbol: String,
      decimals: Int
    }`,
    args: {
      contract: 'String!',
      address: 'String!',
    },
    resolve: async (_, args): Promise<ERC20Balance> => {
      const contract = new (web3() as Web3).eth.Contract(
        [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'account',
                type: 'address',
              },
            ],
            name: 'balanceOf',
            outputs: [
              {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        args.contract,
      );

      const amount = (await contract.methods
        .balanceOf(args.address)
        .call()) as string;

      const contractData = await query.contracts.erc20Contracts({
        contractAddress: [args.contract],
      });
      const { decimals, symbol, name } = contractData[0] || {};

      let amountFormatted;
      if (typeof decimals === 'number') {
        amountFormatted = new BN(amount).shiftedBy(-decimals).toString();
      }

      return {
        amount,
        amountFormatted,
        decimals,
        symbol,
        name,
      };
    },
  },
});

export default schemaComposer.buildSchema();
