import { query, Types } from 'indexer-utils';
import { decodeEvent, DecodedEvent } from './decode';
import {
  ERC1155EventDecodedModel,
  ERC20EventDecodedModel,
  ERC721EventDecodedModel,
} from './schema';

const CONFLICTING_SIGNATURES = [
  'Transfer(address,address,uint256)',
  'Approval(address,address,uint256)',
  'ApprovalForAll(address,address,bool)',
];

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
  const logs = await promise.allSettled(
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
    contractAddress: uniqueContractAddresses,
    properties: ['address'],
  });
  const ercContractAddresses = ercContracts.map((c) => c.address);
  const ercLogs = logs
    .flat()
    .filter((log) => ercContractAddresses.includes(log.address));

  await model.insertMany(
    ercLogs
      .map((log) => {
        const sig = sigs.find((sig) =>
          [`0x${sig.ID}`, `0x${sig._ID}`].includes(log.topic0)
        )!;

        let decoded: DecodedEvent;
        try {
          decoded = decodeEvent(
            type,
            sig,
            log.data,
            [log.topic0, log.topic1, log.topic2, log.topic3, log.topic4].filter(
              (t) => t
            ) as string[]
          );
        } catch (e) {
          // contracts can be more than 1 standard, when the same methods are found on both we know this will blow up for 1 of the contract types as the log data won't match up (e.g. unit256 on transfer is indexed in 721 but not 20)
          if (CONFLICTING_SIGNATURES.includes(sig.SIGNATURE)) {
            return null;
          }
          throw new Error(JSON.stringify(e));
        }
        return {
          contract: log.address,
          blockNumber: log.blockNumber,
          blockTimestamp: log.blockTimestamp,
          transactionHash: log.transactionHash,
          signature: sig.SIGNATURE,
          ...decoded,
        } as Types.Contract.DecodedContractEvent;
      })
      .filter((log) => log)
  );
}
