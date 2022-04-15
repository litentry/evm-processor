import { utils, Types } from 'archive-utils';
import {
  ERC1155ContractModel,
  ERC20ContractModel,
  ERC721ContractModel,
} from './schema';
import fetchTokenData from './fetch-token-data';

export default async function handleContractCreation({
  from: creator,
  receiptContractAddress: _id,
  blockNumber,
  blockTimestamp: timestamp,
  input,
  receiptStatus,
}: Types.Archive.ContractCreationTransaction) {
  // failure (or pre byzantium... may need to handle this better)
  if (!receiptStatus) return;

  const sigs = utils.contract.getContractSignatures(input);
  const erc165 = utils.contract.isType(
    Types.Contract.ContractType.ERC165,
    sigs
  );
  const common = {
    _id,
    creator,
    blockNumber,
    timestamp,
    erc165,
  };

  if (utils.contract.isType(Types.Contract.ContractType.ERC20, sigs)) {
    const data = await fetchTokenData(_id);
    await ERC20ContractModel.create({
      ...common,
      ...data,
    });
    return;
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC721, sigs)) {
    const data = await fetchTokenData(_id, true);
    await ERC721ContractModel.create({
      ...common,
      ...data,
      erc721Enumerable: utils.contract.supports.ERC721Enumerable(sigs),
      erc721Metadata: utils.contract.supports.ERC721Metadata(sigs),
      erc721TokenReceiver: utils.contract.supports.ERC721TokenReceiver(sigs),
    });
    return;
  }

  if (utils.contract.isType(Types.Contract.ContractType.ERC1155, sigs)) {
    const data = await fetchTokenData(_id, true);
    await ERC1155ContractModel.create({
      ...common,
      ...data,
      erc1155MetadataURI: utils.contract.supports.ERC1155Metadata_URI(sigs),
      erc1155TokenReceiver: utils.contract.supports.ERC1155TokenReceiver(sigs),
    });
    return;
  }
}
