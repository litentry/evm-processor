import _ from 'lodash';
import { BigNumber } from 'ethers';
import { Types } from 'indexer-utils';
import { getIntermediatePath } from './utils';
import { SwapMethod, Swap } from './types';

const TRANSFER_METHOD_ID = '0xddf252ad';

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
      log.address === tokenAddressOfMissingAmount &&
      log.topic0.startsWith(TRANSFER_METHOD_ID),
  );

  // sum the transfer events for the missing token - it's not always a single transfer as some token contracts have special cases
  const missingAmount = transferLogs.reduce(
    (prev, curr) => prev.add(BigNumber.from(curr.data)),
    BigNumber.from(0),
  );

  return {
    transactionHash: tx.hash,
    contract: tx.to,
    address: tx.from,
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
