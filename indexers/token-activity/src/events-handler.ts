import { query, Types } from 'indexer-utils';
import { decodeEvent } from './decode';
import {
  ERC1155EventDecodedModel,
  ERC20EventDecodedModel,
  ERC721EventDecodedModel,
} from './schema';

export default async function eventsHandler(
  startBlock: number,
  endBlock: number,
  type: 20 | 721 | 1155,
  sigs: Types.Contract.ContractSignatureItem[],
  model:
    | typeof ERC20EventDecodedModel
    | typeof ERC721EventDecodedModel
    | typeof ERC1155EventDecodedModel
) {
  // get the events
  const logs = await Promise.all(
    sigs.map(async (sig) => {
      const logs = await query.archive.logs({
        startBlock,
        endBlock,
        eventId: `0x${sig.ID}`,
      });
      const _logs = await query.archive.logs({
        startBlock,
        endBlock,
        eventId: `0x${sig._ID}`,
      });
      return [...logs, ..._logs];
    })
  );

  // filter non-erc standard logs
  const uniqueContractAddresses = [
    ...new Set(logs.flat().map((log) => log.address)),
  ];
  const ercContracts = await query.tokenContracts[`erc${type}Contracts`]({
    startBlock,
    endBlock,
    contractAddress: uniqueContractAddresses,
    properties: ['address'],
  });
  const ercContractAddresses = ercContracts.map((c) => c.address);
  const ercLogs = logs
    .flat()
    .filter((log) => ercContractAddresses.includes(log.address));

  await model.insertMany(
    ercLogs.map((log) => {
      const sig = sigs.find((sig) => `0x${sig.ID}` === log.topic0)!;
      return {
        contract: log.address,
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        transactionHash: log.transactionHash,
        signature: sig.SIGNATURE,
        ...decodeEvent(
          type,
          sig,
          log.data,
          [log.topic0, log.topic1, log.topic2, log.topic3, log.topic4].filter(
            (t) => t
          ) as string[]
        ),
      } as Types.Contract.DecodedContractEvent;
    })
  );
}
