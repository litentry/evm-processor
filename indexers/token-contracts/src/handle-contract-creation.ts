import {
  ContractCreationTransaction,
  utils,
  ContractType,
} from 'archive-utils';
import dataSource from './data-source';
import { ERC1155Contract, ERC20Contract, ERC721Contract } from './model';
import fetchTokenData from './fetch-token-data';

export default async function handleContractCreation({
  from: creator,
  receiptContractAddress: id,
  blockNumber,
  blockTimestamp: timestamp,
  input,
  receiptStatus,
}: ContractCreationTransaction) {
  // failure (or pre byzantium... may need to handle this better)
  if (!receiptStatus) return;

  const sigs = utils.contract.getContractSignatures(input);
  const erc165 = utils.contract.isType(ContractType.ERC165, sigs);
  const common = {
    id,
    creator,
    blockNumber,
    timestamp,
    erc165,
  };

  if (utils.contract.isType(ContractType.ERC20, sigs)) {
    console.log('ERC20');
    const data = await fetchTokenData(id);
    const contract = new ERC20Contract({
      ...common,
      ...data,
    });
    await dataSource.manager.save(contract);
    return;
  }

  if (utils.contract.isType(ContractType.ERC721, sigs)) {
    console.log('ERC721');

    const data = await fetchTokenData(id, true);
    const contract = new ERC721Contract({
      ...common,
      ...data,
      erc721Enumerable: utils.contract.supports.ERC721Enumerable(sigs),
      erc721Metadata: utils.contract.supports.ERC721Metadata(sigs),
      erc721TokenReceiver: utils.contract.supports.ERC721TokenReceiver(sigs),
    });
    await dataSource.manager.save(contract);
    return;
  }

  if (utils.contract.isType(ContractType.ERC1155, sigs)) {
    console.log('ERC1155');
    const data = await fetchTokenData(id, true);
    const contract = new ERC1155Contract({
      ...common,
      ...data,
      erc1155MetadataURI: utils.contract.supports.ERC1155Metadata_URI(sigs),
      erc1155TokenReceiver: utils.contract.supports.ERC1155TokenReceiver(sigs),
    });
    await dataSource.manager.save(contract);
    return;
  }
}
