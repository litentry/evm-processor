import 'dotenv/config';
import mongoose from 'mongoose';
import { graphqlServer, processor, utils } from 'archive-utils';
import schema, {
  ERC20TransactionDecodedModel,
  ERC721TransactionDecodedModel,
  ERC1155TransactionDecodedModel,
} from './schema';
import { port, start, end, batchSize } from './config';
import extrinsicsHandler from './extrinsics-handler';

const standards = [
  {
    type: 20,
    model: ERC20TransactionDecodedModel,
    extrinsics: utils.contract.CONTRACT_SIGNATURES.ERC20.EXTRINSICS,
  },
  {
    type: 721,
    model: ERC721TransactionDecodedModel,
    extrinsics: utils.contract.CONTRACT_SIGNATURES.ERC721.EXTRINSICS,
  },
  {
    type: 1155,
    model: ERC1155TransactionDecodedModel,
    extrinsics: utils.contract.CONTRACT_SIGNATURES.ERC1155.EXTRINSICS,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  processor(start, end, batchSize, async (startBlock, endBlock) => {
    await Promise.all(
      standards.map(async (standard) => {
        await extrinsicsHandler(
          startBlock,
          endBlock,
          standard.type as 20 | 721 | 1155,
          standard.extrinsics,
          standard.model
        );
      })
    );
  });

  graphqlServer(schema, port);
})();
