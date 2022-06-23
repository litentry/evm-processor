import { Types } from 'indexer-utils';
import { DecodedEvent } from './types';
import { getSignaturesByErcStandard, standards, decodeLog } from './utils';

const CONFLICTING_SIGNATURES = [
  'Transfer(address,address,uint256)',
  'Approval(address,address,uint256)',
  'ApprovalForAll(address,address,bool)',
];

export default function transform(
  logs: Types.Archive.Log[][],
): Types.Contract.DecodedContractEvent[][] {
  const transformed = standards.map((standard, i) => {
    const signatures = getSignaturesByErcStandard(standard);

    return logs[i]
      .map((log) => {
        const sig = signatures.find((sig) => `0x${sig.ID}` === log.topic0)!;

        let decoded: DecodedEvent;
        try {
          decoded = decodeLog(
            standard,
            sig,
            log.data,
            [log.topic0, log.topic1, log.topic2, log.topic3, log.topic4].filter(
              (t) => t,
            ) as string[],
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
          logIndex: log.logIndex,
          signature: sig.SIGNATURE,
          signatureHash: sig.ID,
          ...decoded,
        } as Types.Contract.DecodedContractEvent;
      })
      .filter((log) => log);
  });

  // TS isn't aware of the filter above
  return transformed as Types.Contract.DecodedContractEvent[][];
}
