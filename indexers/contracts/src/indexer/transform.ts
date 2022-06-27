import { utils, Types } from 'indexer-utils';
import fetchTokenData from './fetch-token-data';
import { TransformResult, Model } from './types';

export default async function transform(
  txs: Types.Archive.ContractCreationTransaction[],
): Promise<TransformResult> {
  const data: TransformResult = {
    ERC20: [],
    ERC721: [],
    ERC1155: [],
    UNISWAPV2: [],
    UNISWAPV3: [],
  };

  const arr = await Promise.all(txs.map(createModels));

  arr.forEach((models) => {
    models.forEach((model) => {
      switch (model.type) {
        case Types.Contract.ContractType.ERC20: {
          data.ERC20.push(model.data);
          break;
        }
        case Types.Contract.ContractType.ERC721: {
          data.ERC721.push(model.data);
          break;
        }
        case Types.Contract.ContractType.ERC1155: {
          data.ERC1155.push(model.data);
          break;
        }
        case Types.Contract.ContractType.UNISWAPV2: {
          data.UNISWAPV2.push(model.data);
          break;
        }
        case Types.Contract.ContractType.UNISWAPV3: {
          data.UNISWAPV3.push(model.data);
          break;
        }
        default: {
          throw Error('Unknown model type');
        }
      }
    });
  });

  return data;
}

async function createModels({
  from: creator,
  receiptContractAddress: _id,
  blockNumber,
  blockTimestamp: timestamp,
  input,
}: Types.Archive.ContractCreationTransaction): Promise<Model[]> {
  const erc165 = utils.contract.isType(
    Types.Contract.ContractType.ERC165,
    input,
  );
  const common = {
    _id,
    creator,
    blockNumber,
    timestamp,
    erc165,
  };

  const models: Model[] = [];

  if (utils.contract.isType(Types.Contract.ContractType.ERC721, input)) {
    const data = await fetchTokenData(_id, true);
    models.push({
      type: Types.Contract.ContractType.ERC721,
      data: {
        ...common,
        ...data,
        erc721Enumerable: utils.contract.supports.ERC721Enumerable(input),
        erc721Metadata: utils.contract.supports.ERC721Metadata(input),
        erc721TokenReceiver: utils.contract.supports.ERC721TokenReceiver(input),
      },
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC1155, input)) {
    const data = await fetchTokenData(_id, true);
    models.push({
      type: Types.Contract.ContractType.ERC1155,
      data: {
        ...common,
        ...data,
        erc1155MetadataURI: utils.contract.supports.ERC1155Metadata_URI(input),
        erc1155TokenReceiver:
          utils.contract.supports.ERC1155TokenReceiver(input),
      },
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC20, input)) {
    const data = await fetchTokenData(_id);
    models.push({
      type: Types.Contract.ContractType.ERC20,
      data: {
        ...common,
        ...data,
      },
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.UNISWAPV2, input)) {
    models.push({
      type: Types.Contract.ContractType.UNISWAPV2,
      data: common,
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.UNISWAPV3, input)) {
    models.push({
      type: Types.Contract.ContractType.UNISWAPV3,
      data: common,
    });
  }

  return models;
}
