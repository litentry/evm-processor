import BN from 'bignumber.js';
import { ERC20Transfer, ExtractedData } from './types';
import { decodeTransfer } from './utils';

export default function transform({
  transferLogs,
  erc20Contracts,
}: ExtractedData): ERC20Transfer[] {
  const transfers = transferLogs.map((log) => {
    const { to, from, amount } = decodeTransfer(log.data, [
      log.topic0,
      log.topic1!,
      log.topic2!,
    ]);

    const contract = erc20Contracts.find(
      (contract) => contract._id === log.address,
    )!;

    const transfer: ERC20Transfer = {
      _id: log._id,
      contract: log.address,
      from,
      to,
      amount,
      amountFormatted: contract.decimals
        ? new BN(amount).shiftedBy(-contract.decimals).toString()
        : undefined,
      decimals: contract.decimals,
      name: contract.name,
      symbol: contract.symbol,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      transactionHash: log.transactionHash,
      transactionId: log.transactionId,
    };

    return transfer;
  });

  return transfers;
}
