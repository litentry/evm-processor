import { repository, utils } from 'indexer-utils';
import eventsHandler from './events-handler';
import extrinsicsHandler from './extrinsics-handler';
import {
  ERC20TransactionDecodedModel,
  ERC20EventDecodedModel,
  ERC721TransactionDecodedModel,
  ERC721EventDecodedModel,
  ERC1155TransactionDecodedModel,
  ERC1155EventDecodedModel,
} from '../schema';

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

export default async function handler(startBlock: number, endBlock: number) {
  const results = await Promise.allSettled(
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

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }

  await repository.indexedBlockRange.save(startBlock, endBlock);
}
