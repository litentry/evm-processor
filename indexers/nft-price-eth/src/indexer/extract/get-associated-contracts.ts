import { query } from 'indexer-utils';
import { AssociatedContracts, AssociatedLogs } from '../types';

export default async function getAssociatedContracts(
  logs: AssociatedLogs,
): Promise<AssociatedContracts> {
  const erc20ContractAddresses = [
    ...new Set(logs.erc20.map((log) => log.address)),
  ];
  const erc721ContractAddresses = [
    ...new Set(logs.erc721.map((log) => log.address)),
  ];
  const erc1155ContractAddresses = [
    ...new Set(logs.erc1155Single.map((log) => log.address)),
    ...new Set(logs.erc1155Batch.map((log) => log.address)),
  ];

  const [erc20, erc721, erc1155] = await Promise.all([
    query.contracts.erc20Contracts({
      addresses: erc20ContractAddresses,
      properties: ['_id', 'name', 'symbol', 'decimals'],
    }),
    query.contracts.erc721Contracts({
      addresses: erc721ContractAddresses,
      properties: ['_id', 'name'],
    }),
    query.contracts.erc1155Contracts({
      addresses: erc1155ContractAddresses,
      properties: ['_id', 'name'],
    }),
  ]);

  return {
    erc20,
    erc721,
    erc1155,
  };
}
