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

  const sigs = utils.getContractSignatures(input);
  const common = {
    id,
    creator,
    blockNumber,
    timestamp,
  };

  if (utils.isContractType(ContractType.ERC20, sigs)) {
    console.log('ERC20');
    const data = await fetchTokenData(id);
    const contract = new ERC20Contract({
      ...common,
      ...data,
    });
    await dataSource.manager.save(contract);
    return;
  }

  if (utils.isContractType(ContractType.ERC721, sigs)) {
    console.log('ERC721');
    const data = await fetchTokenData(id, true);
    const contract = new ERC721Contract({
      ...common,
      ...data,
    });
    await dataSource.manager.save(contract);
    return;
  }

  if (utils.isContractType(ContractType.ERC1155, sigs)) {
    console.log('ERC1155');
    const data = await fetchTokenData(id, true);
    const contract = new ERC1155Contract({
      ...common,
      ...data,
    });
    await dataSource.manager.save(contract);
    return;
  }
}