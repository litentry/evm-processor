import { Types, utils } from 'indexer-utils';
import {
  ERC1155EventDecodedModel,
  ERC20EventDecodedModel,
  ERC721EventDecodedModel,
} from '../schema';
import { ErcStandard } from './types';
import { standards } from './utils';

export default async function load(
  data: Types.Contract.DecodedContractEvent[][],
): Promise<void> {
  const results = await Promise.allSettled(
    standards.map(async (standard, i) =>
      utils.upsertMongoModels(getModelByStandard(standard), data[i], [
        'logIndex',
        'blockNumber',
      ]),
    ),
  );

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }
}

function getModelByStandard(standard: ErcStandard) {
  switch (standard) {
    case 20:
      return ERC20EventDecodedModel;
    case 721:
      return ERC721EventDecodedModel;
    case 1155:
      return ERC1155EventDecodedModel;
    default:
      throw Error('Unknown standard');
  }
}