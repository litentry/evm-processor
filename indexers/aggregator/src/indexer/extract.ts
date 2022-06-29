import { query, Types, utils } from 'indexer-utils';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<Types.Archive.ContractTransactionWithLogs[]> {
  const batches = utils.createBatches(startBlock, endBlock, 20);

  const results = await Promise.all(
    batches.map(async (batch) => {
      return query.archive.contractTransactionsWithLogs({
        startBlock: batch.startBlock,
        endBlock: batch.endBlock,
        transactionProperties: [
          'blockNumber',
          'blockTimestamp',
          'gas',
          'value',
        ],
        logProperties: ['address'],
      });
    }),
  );

  return results.flatMap((txArr) => txArr);
}

// export default async function extract(
//   startBlock: number,
//   endBlock: number,
// ): Promise<Types.Archive.ContractTransactionWithLogs[][]> {
//   const data = await Promise.all(
//     standards.map(async (standard) => {
//       const signatures = getSignaturesByErcStandard(standard);

//       const rawLogs = await Promise.all(
//         signatures.map(async (signature) =>
//           query.archive.contractTransactionsWithLogs({
//             startBlock,
//             endBlock,
//             eventId: `0x${signature.ID}`,
//           }),
//         ),
//       );

//       const uniqueContractAddresses = [
//         ...new Set(rawLogs.flat().map((log) => log.address)),
//       ];

//       const ercContracts = await getContractsByErcStandard(
//         standard,
//         uniqueContractAddresses,
//       );
//       const ercContractAddresses = ercContracts.map((c) => c.address);

//       const ercLogs = rawLogs
//         .flat()
//         .filter((log) => ercContractAddresses.includes(log.address));

//       return ercLogs;
//     }),
//   );

//   return data;
// }

// async function getContractsByErcStandard(
//   ercStandard: number,
//   uniqueContractAddresses: string[],
// ) {
//   switch (ercStandard) {
//     case 20:
//       return query.contracts.erc20Contracts({
//         contractAddress: uniqueContractAddresses,
//         properties: ['address'],
//       });
//     case 721:
//       return query.contracts.erc721Contracts({
//         contractAddress: uniqueContractAddresses,
//         properties: ['address'],
//       });
//     case 1155:
//       return query.contracts.erc1155Contracts({
//         contractAddress: uniqueContractAddresses,
//         properties: ['address'],
//       });
//     default:
//       throw Error('unknown standard');
//   }
// }
