import _ from 'lodash';
import { BigNumber } from 'ethers';
import { TransactionWithLogs } from 'processor';
import { TRANSFER_CALL } from './constants';
import getIntermediatePath from './get-intermediate-path';
import { UniswapLPSwap, UniswapLPSwapMethod } from './model';
import dataSource from './data-source';
import getOrCreateToken from './get-or-create-token';

export async function handleSwap(
  method: UniswapLPSwapMethod,
  tx: TransactionWithLogs,
  deadline: BigInt,
  path: string[],
  token0Amount: BigInt | 'unknown',
  token1Amount: BigInt | 'unknown',
): Promise<void> {
  // the token addresses come through checksummed, which is purely for helping identify invalid addresses during transactions
  // it's much easier for indexing/querying to just enfore lowercase everywhere
  const lowerCasePath = path.map((address) => address.toLowerCase());
  const token0 = await getOrCreateToken(lowerCasePath[0]);
  const token1 = await getOrCreateToken(lowerCasePath[path.length - 1]);

  // We need to find the actual amount of the non-fixed side of the swap, to do this we looks for the transfer events on the relevant token contract
  const tokenAddressOfMissingAmount =
    token0Amount === 'unknown' ? token0.id : token1.id;

  const transferLogs = tx.logs.filter(
    (log) =>
      log.address === tokenAddressOfMissingAmount &&
      log.topic0.startsWith(`0x${TRANSFER_CALL.ID}`),
  );

  // todo - delete when confident in the above logic
  if (!transferLogs.length) {
    throw new Error(`Transfer log missing from tx: ${tx.hash}`);
  }

  // sum the transfer events for the missing token - it's not always a single transfer as some token contracts have special cases
  const missingAmount = transferLogs
    .reduce(
      (prev, curr) => prev.add(BigNumber.from(curr.data)),
      BigNumber.from(0),
    )
    .toBigInt();

  const swap = new UniswapLPSwap({
    id: tx.hash,
    contract: tx.to_address,
    account: tx.from_address,
    method,
    pair: `${token0.id}:${token1.id}`,
    pairSymbol: `${token0.symbol || 'unknown'}:${token1.symbol || 'unknown'}`,
    intermediatePath: getIntermediatePath(lowerCasePath),
    deadline: deadline.valueOf(),
    token0: token0,
    token1: token1,
    token0Amount: (token0Amount === 'unknown'
      ? missingAmount
      : token0Amount
    ).valueOf(),
    token1Amount: (token1Amount === 'unknown'
      ? missingAmount
      : token1Amount
    ).valueOf(),
    gas: tx.gas.valueOf(),
    blockNumber: tx.block_number.valueOf(),
    timestamp: tx.block_timestamp,
  });

  await dataSource.manager.save(swap);
}
