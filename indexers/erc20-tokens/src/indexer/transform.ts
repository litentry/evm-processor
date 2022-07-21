import { Types } from 'indexer-utils';
import { ExtractedData } from './types';
import { decodeTransfer, TRANSFER_EVENT_SIGNATURE } from './utils';

export default function transform({
  transferLogs,
  erc20Contracts,
}: ExtractedData): Types.Erc20.Transfer[] {
  const transfers = transferLogs.reduce((prev, log) => {
    try {
      const { to, from, amount } = decodeTransfer(log.data, [
        TRANSFER_EVENT_SIGNATURE,
        log.topic1!,
        log.topic2!,
      ]);

      const contract = erc20Contracts.find(
        (contract) => contract._id === log.address,
      )!;

      const transfer: Types.Erc20.Transfer = {
        _id: log._id,
        contract: log.address,
        from,
        to,
        amount: amount.toString(),
        decimals: contract.decimals,
        name: contract.name,
        symbol: contract.symbol,
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        transactionHash: log.transactionHash,
      };

      return [...prev, transfer];
    } catch (e) {
      console.error(
        `Non compliant log on tx: ${log.transactionHash} at index ${log.logIndex}`,
      );
      /*
      Some transactions emit dodgy logs e.g. https://etherscan.io/tx/0x67b36471c1795588ac7174a73d22f32e6e1956a30dd26d2e8b5c0f9e72b8141b
      */
      return prev;
    }
  }, [] as Types.Erc20.Transfer[]);

  return transfers;
}
