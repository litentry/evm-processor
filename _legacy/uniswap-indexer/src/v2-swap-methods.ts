import { TransactionWithLogs, utils } from 'processor';
import { BigNumber } from 'ethers';
import { UNISWAP } from './constants';
import { handleSwap } from './handle-swap';
import { UniswapLPSwapMethod } from './model';

const methods = {
  [UniswapLPSwapMethod.swapTokensForExactETH]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountOut, amountInMax, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapTokensForExactETH,
      )!.PARAMS,
    ) as [BigNumber, BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapTokensForExactETH,
      tx,
      deadline.toBigInt(),
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  },
  [UniswapLPSwapMethod.swapExactETHForTokens]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountOutMin, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapExactETHForTokens,
      )!.PARAMS,
    ) as [BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapExactETHForTokens,
      tx,
      deadline.toBigInt(),
      path,
      tx.value,
      'unknown',
    );
  },
  [UniswapLPSwapMethod.swapTokensForExactTokens]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountOut, amountInMax, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapTokensForExactTokens,
      )!.PARAMS,
    ) as [BigNumber, BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapTokensForExactTokens,
      tx,
      deadline.toBigInt(),
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  },
  [UniswapLPSwapMethod.swapExactTokensForTokens]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountIn, amountOutMin, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapExactTokensForTokens,
      )!.PARAMS,
    ) as [BigNumber, BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapExactTokensForTokens,
      tx,
      deadline.toBigInt(),
      path,
      amountIn.toBigInt(),
      'unknown',
    );
  },
  [UniswapLPSwapMethod.swapExactTokensForETH]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountIn, amountOutMin, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapExactTokensForETH,
      )!.PARAMS,
    ) as [BigNumber, BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapExactTokensForETH,
      tx,
      deadline.toBigInt(),
      path,
      amountIn.toBigInt(),
      'unknown',
    );
  },
  [UniswapLPSwapMethod.swapETHForExactTokens]: async (
    tx: TransactionWithLogs,
  ) => {
    const [amountOut, path, to, deadline] = utils.decodeCall(
      tx.input,
      UNISWAP.V2_SWAP_METHODS.find(
        (sm) => sm.NAME === UniswapLPSwapMethod.swapETHForExactTokens,
      )!.PARAMS,
    ) as [BigNumber, string[], string, BigNumber];

    await handleSwap(
      UniswapLPSwapMethod.swapETHForExactTokens,
      tx,
      deadline.toBigInt(),
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  },
};

export default methods;
