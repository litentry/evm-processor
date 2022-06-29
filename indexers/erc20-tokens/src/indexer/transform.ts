import BN from 'bignumber.js';
import { ERC20Transfer, ExtractedData } from './types';
import { decodeTransfer } from './utils';

export default function transform({
  transferLogs,
  erc20Contracts,
}: ExtractedData): ERC20Transfer[] {
  const filteredLogs = transferLogs.filter((log) => {
    /*
    ERC721 contracts can also be matched ERC20 contracts, they have matching signatures,
    but for ERC721 the last param (token) is indexed, whereas it is the unindexed amount
    for ERC20. When indexed it appears as topic3, when unindexed it appears as data.
    */
    return !log.topic3;
  });
  const transfers = filteredLogs.map((log) => {
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
    };

    return transfer;
  });

  return transfers;
}
