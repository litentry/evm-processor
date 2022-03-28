import { BigNumber } from 'ethers';
import _ from 'lodash';
import { Log } from 'processor';
import { UNISWAP, TRANSFER_CALL } from './constants';
import getIntermediatePath from './get-intermediate-path';
import getOrCreateToken from './get-or-create-token';
import { UniswapLPSwap } from './types';

export function handleSwap(
  transactionIndex: BigInt,
  transactionHash: string,
  timestamp: Date,
  blockNumber: BigInt,
  gas: BigInt,
  address: string,
  deadline: BigInt,
  path: string[],
  token0Amount: BigInt | 'unknown',
  token1Amount: BigInt | 'unknown',
  logs: Log[]
): void {
  const token0 = getOrCreateToken(path[0]);
  const token1 = getOrCreateToken(path[path.length - 1]);

  // We need to find the actual amount of the non-fixed side of the swap, to do this we looks for the transfer events on the relevant token contract
  const tokenAddressOfMissingAmount =
    token0Amount === 'unknown' ? token0.id : token1.id;

  const transferLogs = logs.filter(
    (log) =>
      log.address === tokenAddressOfMissingAmount.toLowerCase() &&
      log.topic0.startsWith(`0x${TRANSFER_CALL.ID}`)
  );

  // todo - delete when confident in the above logic
  if (!transferLogs.length) {
    throw new Error(`Transfer log missing from tx: ${transactionHash}`);
  }

  // sum the transfer events for the missing token - it's not always a single transfer as some token contracts have special cases
  const missingAmount = transferLogs
    .reduce(
      (prev, curr) => prev.add(BigNumber.from(curr.data)),
      BigNumber.from(0)
    )
    .toBigInt();

  // SWAP
  const swapId = `${blockNumber.toString()}:${transactionIndex.toString()}`;
  // todo revert when we have generated models
  // const swap = new UniswapLPSwap(swapId);
  // swap.account = address;
  // swap.pair = `${token0.id}:${token1.id}`;
  // swap.pairSymbol = `${token0.symbol}:${token1.symbol}`;
  // swap.intermediatePath = getIntermediatePath(path);
  // swap.deadline = deadline;
  // swap.token0 = token0.id;
  // swap.token1 = token1.id;
  // swap.token0Amount = token0Amount;
  // swap.token1Amount = token1Amount;
  // swap.gas = gas;
  // swap.blockNumber = blockNumber;
  // swap.timestamp = timestamp;
  // swap.transactionHash = transactionHash;
  // swap.save();
  const swap: UniswapLPSwap = {
    id: swapId,
    account: address,
    pair: `${token0.id}:${token1.id}`,
    intermediatePath: getIntermediatePath(path),
    deadline,
    token0,
    token1,
    token0Amount: token0Amount === 'unknown' ? missingAmount : token0Amount,
    token1Amount: token1Amount === 'unknown' ? missingAmount : token1Amount,
    gas,
    blockNumber,
    timestamp,
    transactionHash,
  };
  console.log(swap);
}
