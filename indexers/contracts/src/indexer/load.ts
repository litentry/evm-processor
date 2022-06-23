import { utils } from 'indexer-utils';
import { TransformResult } from './types';
import {
  ERC1155ContractModel,
  ERC20ContractModel,
  ERC721ContractModel,
  UniswapV2ContractModel,
  UniswapV3ContractModel,
} from '../schema';

function getModel(key: string) {
  switch (key) {
    case 'ERC20':
      return ERC20ContractModel;
    case 'ERC721':
      return ERC721ContractModel;
    case 'ERC1155':
      return ERC1155ContractModel;
    case 'UNISWAPV2':
      return UniswapV2ContractModel;
    case 'UNISWAPV3':
      return UniswapV3ContractModel;
    default:
      throw Error('Unknown model');
  }
}

export default async function load(data: TransformResult) {
  await utils.ensureShardedCollections(
    ERC1155ContractModel,
    ERC20ContractModel,
    ERC721ContractModel,
    UniswapV2ContractModel,
    UniswapV3ContractModel,
  );

  const results = await Promise.allSettled(
    Object.keys(data).map(async (key) => {
      await utils.upsertMongoModels(
        getModel(key),
        data[key as keyof TransformResult],
        ['address'],
      );
    }),
  );

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }
}
