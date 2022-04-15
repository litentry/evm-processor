import 'dotenv/config';
import mongoose from 'mongoose';
import { graphqlServer, processor, utils } from 'archive-utils';
import schema, {
  ERC20TransactionDecodedModel,
  ERC721TransactionDecodedModel,
  ERC1155TransactionDecodedModel,
  ERC20EventDecodedModel,
  ERC721EventDecodedModel,
  ERC1155EventDecodedModel,
} from './schema';
import { port, start, end, batchSize } from './config';
import extrinsicsHandler from './extrinsics-handler';
import eventsHandler from './events-handler';

const standards = [
  {
    type: 20,
    txModel: ERC20TransactionDecodedModel,
    evModel: ERC20EventDecodedModel,
    sigs: utils.contract.CONTRACT_SIGNATURES.ERC20,
  },
  {
    type: 721,
    txModel: ERC721TransactionDecodedModel,
    evModel: ERC721EventDecodedModel,
    sigs: utils.contract.CONTRACT_SIGNATURES.ERC721,
  },
  {
    type: 1155,
    txModel: ERC1155TransactionDecodedModel,
    evModel: ERC1155EventDecodedModel,
    sigs: utils.contract.CONTRACT_SIGNATURES.ERC1155,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  processor(start, end, batchSize, async (startBlock, endBlock) => {
    await Promise.all(
      standards.map(async (standard) => {
        // todo -> pull the queries up here so we don't duplicate the isERCN checks
        await extrinsicsHandler(
          startBlock,
          endBlock,
          standard.type as 20 | 721 | 1155,
          standard.sigs.EXTRINSICS,
          standard.txModel
        );
        await eventsHandler(
          startBlock,
          endBlock,
          standard.type as 20 | 721 | 1155,
          standard.sigs.EVENTS,
          standard.evModel
        );
      })
    );
  });

  graphqlServer(schema, port);
})();
