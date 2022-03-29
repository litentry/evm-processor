import _ from 'lodash';
import { BigNumber } from 'ethers';
import { DataSource } from 'typeorm';
import { TransactionWithLogs } from 'processor';
import { TRANSFER_CALL } from './constants';
import getIntermediatePath from './get-intermediate-path';
import { UniswapLPSwap, UniswapLPToken } from './model';

export async function handleSwap(
  dataSource: DataSource,
  tx: TransactionWithLogs,
  deadline: BigInt,
  path: string[],
  token0Amount: BigInt | 'unknown',
  token1Amount: BigInt | 'unknown'
): Promise<void> {
  const tokenRepository = dataSource.getRepository(UniswapLPToken);

  let token0 = await tokenRepository.findOneBy({ id: path[0] });
  if (!token0) {
    token0 = new UniswapLPToken({ id: path[0] });
    await dataSource.manager.save(token0);
  }

  let token1 = await tokenRepository.findOneBy({ id: path[path.length - 1] });
  if (!token1) {
    token1 = new UniswapLPToken({ id: path[path.length - 1] });
    await dataSource.manager.save(token1);
  }

  // We need to find the actual amount of the non-fixed side of the swap, to do this we looks for the transfer events on the relevant token contract
  const tokenAddressOfMissingAmount =
    token0Amount === 'unknown' ? token0.id : token1.id;

  const transferLogs = tx.logs.filter(
    (log) =>
      log.address === tokenAddressOfMissingAmount.toLowerCase() &&
      log.topic0.startsWith(`0x${TRANSFER_CALL.ID}`)
  );

  // todo - delete when confident in the above logic
  if (!transferLogs.length) {
    throw new Error(`Transfer log missing from tx: ${tx.hash}`);
  }

  // sum the transfer events for the missing token - it's not always a single transfer as some token contracts have special cases
  const missingAmount = transferLogs
    .reduce(
      (prev, curr) => prev.add(BigNumber.from(curr.data)),
      BigNumber.from(0)
    )
    .toBigInt();

  const swap = new UniswapLPSwap({
    id: `${tx.block_number.toString()}:${tx.transaction_index.toString()}`,
    account: tx.from_address,
    pair: `${token0.id}:${token1.id}`,
    // pairSymbol: `${token0.symbol}:${token1.symbol}`,
    intermediatePath: getIntermediatePath(path),
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
    transactionHash: tx.hash,
  });

  await dataSource.manager.save(swap);
}
