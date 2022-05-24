import { utils, Types } from 'indexer-utils';
import {
  ERC1155ContractModel,
  ERC20ContractModel,
  ERC721ContractModel,
  UniswapV2ContractModel,
  UniswapV3ContractModel,
} from '../schema';
import fetchTokenData from './fetch-token-data';

export default async function handleContractCreation({
  from: creator,
  receiptContractAddress: address,
  blockNumber,
  blockTimestamp: timestamp,
  input,
  receiptStatus,
}: Types.Archive.ContractCreationTransaction) {
  // failure (or pre byzantium... may need to handle this better)
  if (!receiptStatus) return;

  const erc165 = utils.contract.isType(
    Types.Contract.ContractType.ERC165,
    input,
  );
  const common = {
    address,
    creator,
    blockNumber,
    timestamp,
    erc165,
  };

  if (utils.contract.isType(Types.Contract.ContractType.ERC721, input)) {
    const data = await fetchTokenData(address, true);
    await ERC721ContractModel.create({
      ...common,
      ...data,
      erc721Enumerable: utils.contract.supports.ERC721Enumerable(input),
      erc721Metadata: utils.contract.supports.ERC721Metadata(input),
      erc721TokenReceiver: utils.contract.supports.ERC721TokenReceiver(input),
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC1155, input)) {
    const data = await fetchTokenData(address, true);
    await ERC1155ContractModel.create({
      ...common,
      ...data,
      erc1155MetadataURI: utils.contract.supports.ERC1155Metadata_URI(input),
      erc1155TokenReceiver: utils.contract.supports.ERC1155TokenReceiver(input),
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC20, input)) {
    const data = await fetchTokenData(address);
    await ERC20ContractModel.create({
      ...common,
      ...data,
    });
  }

  if (utils.contract.isType(Types.Contract.ContractType.UNISWAPV2, input)) {
    await UniswapV2ContractModel.create(common);
  }

  if (utils.contract.isType(Types.Contract.ContractType.UNISWAPV3, input)) {
    await UniswapV3ContractModel.create(common);
  }
}
