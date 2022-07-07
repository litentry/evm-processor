import { BigNumber } from 'ethers';
import { Types } from 'indexer-utils';
import { Swap, SwapMethod } from '../types';
import { getIntermediatePath } from '../utils';

export const TRANSFER_METHOD_ID =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export default function transformSwap(
  method: SwapMethod,
  tx: Types.Archive.ContractTransactionWithLogs,
  deadline: BigNumber,
  path: string[],
  token0Amount: BigNumber | 'unknown',
  token1Amount: BigNumber | 'unknown',
): Swap {
  // the token addresses come through checksummed, which is purely for helping identify invalid addresses during transactions
  // it's much easier for indexing/querying to just enfore lowercase everywhere
  const lowerCasePath = path.map((address) => address.toLowerCase());
  const token0 = lowerCasePath[0];
  const token1 = lowerCasePath[path.length - 1];

  // We need to find the actual amount of the non-fixed side of the swap, to do this we looks for the transfer events on the relevant token contract
  const tokenAddressOfMissingAmount =
    token0Amount === 'unknown' ? token0 : token1;

  const transferLogs = tx.logs.filter(
    (log) =>
      log.address.toLowerCase() === tokenAddressOfMissingAmount &&
      log.topic0 === TRANSFER_METHOD_ID,
  );

  // sum the transfer events for the missing token - it's not always a single transfer as some token contracts have special cases
  const missingAmount = transferLogs.reduce(
    (prev, curr) => prev.add(BigNumber.from(curr.data)),
    BigNumber.from(0),
  );

  return {
    _id: tx._id,
    contract: tx.to.toLowerCase(),
    address: tx.from.toLowerCase(),
    method,
    pair: `${token0}:${token1}`,
    intermediatePath: getIntermediatePath(lowerCasePath),
    deadline: deadline.toString(),
    token0: token0,
    token1: token1,
    token0Amount: (token0Amount === 'unknown'
      ? missingAmount
      : token0Amount
    ).toString(),
    token1Amount: (token1Amount === 'unknown'
      ? missingAmount
      : token1Amount
    ).toString(),
    gas: tx.gas,
    blockNumber: tx.blockNumber,
    timestamp: tx.blockTimestamp,
  };
}
