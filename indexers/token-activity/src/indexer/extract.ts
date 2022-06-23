import { query, Types } from 'indexer-utils';
import { getSignaturesByErcStandard, standards } from './utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<Types.Archive.Log[][]> {
  const data = await Promise.all(
    standards.map(async (standard) => {
      const signatures = getSignaturesByErcStandard(standard);

      const rawLogs = await Promise.all(
        signatures.map(async (signature) =>
          query.archive.logs({
            startBlock,
            endBlock,
            eventId: `0x${signature.ID}`,
          }),
        ),
      );

      const uniqueContractAddresses = [
        ...new Set(rawLogs.flat().map((log) => log.address)),
      ];

      const ercContracts = await getContractsByErcStandard(
        standard,
        uniqueContractAddresses,
      );
      const ercContractAddresses = ercContracts.map((c) => c.address);

      const ercLogs = rawLogs
        .flat()
        .filter((log) => ercContractAddresses.includes(log.address));

      return ercLogs;
    }),
  );

  return data;
}

async function getContractsByErcStandard(
  ercStandard: number,
  uniqueContractAddresses: string[],
) {
  switch (ercStandard) {
    case 20:
      return query.contracts.erc20Contracts({
        contractAddress: uniqueContractAddresses,
        properties: ['address'],
      });
    case 721:
      return query.contracts.erc721Contracts({
        contractAddress: uniqueContractAddresses,
        properties: ['address'],
      });
    case 1155:
      return query.contracts.erc1155Contracts({
        contractAddress: uniqueContractAddresses,
        properties: ['address'],
      });
    default:
      throw Error('unknown standard');
  }
}
