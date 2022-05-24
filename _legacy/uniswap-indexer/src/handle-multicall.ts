import _ from 'lodash';
import { BigNumber } from 'ethers';
import { TransactionWithLogs, utils } from 'processor';
import { UniswapLPSwapMethod } from './model';
import { UNISWAP } from './constants';
import { handleSwap } from './handle-swap';

const swapMethodIds = UNISWAP.V3_MULTICALL_SWAP_METHODS.map(
  (method) => method.ID,
);

export default async function handleMulticall(tx: TransactionWithLogs) {
  const swapMethodsCalled = utils.findMethodsInInput(tx.input, swapMethodIds);
  if (!swapMethodsCalled.length) {
    return;
  }

  const [deadline, calls] = utils.decodeCall(
    tx.input,
    UNISWAP.V3_MULTICALL.PARAMS,
  );
  const relevantCalls = utils.filterCalls(calls, swapMethodsCalled);

  const decodedCalls: {
    methodName: string;
    decoded: any[];
  }[] = [];

  relevantCalls.forEach((call) => {
    const methodId = utils.getMethodIdFromCall(call);

    const CONSTS = UNISWAP.V3_MULTICALL_SWAP_METHODS.find(
      (method) => method.ID === methodId,
    )!;

    decodedCalls.push({
      methodName: CONSTS.NAME,
      decoded: utils.decodeCall(call, CONSTS.PARAMS) as any[],
    });
  });

  for (let i = 0; i < decodedCalls.length; i++) {
    switch (decodedCalls[i].methodName) {
      case UniswapLPSwapMethod.swapTokensForExactETH: {
        await swapTokensForExactETH(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
        break;
      }
      case UniswapLPSwapMethod.swapExactETHForTokens: {
        await swapExactETHForTokens(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, string[], string]);
        break;
      }
      case UniswapLPSwapMethod.swapTokensForExactTokens: {
        await swapTokensForExactTokens(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
        break;
      }
      case UniswapLPSwapMethod.swapExactTokensForTokens: {
        await swapExactTokensForTokens(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
        break;
      }
      case UniswapLPSwapMethod.swapExactTokensForETH: {
        await swapExactTokensForETH(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
        break;
      }
      case UniswapLPSwapMethod.swapETHForExactTokens: {
        await swapETHForExactTokens(
          tx,
          deadline.toBigInt(),
        )(decodedCalls[i].decoded as [BigNumber, string[], string]);
        break;
      }
      default: {
        throw new Error(`Method ${decodedCalls[i].methodName} missing`);
      }
    }
  }
}

const swapTokensForExactETH = (tx: TransactionWithLogs, deadline: BigInt) => {
  return async ([amountOut, amountInMax, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapTokensForExactETH,
      tx,
      deadline,
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  };
};

const swapExactETHForTokens = (tx: TransactionWithLogs, deadline: BigInt) => {
  return async ([amountOutMin, path, to]: [BigNumber, string[], string]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapExactETHForTokens,
      tx,
      deadline,
      path,
      tx.value,
      'unknown',
    );
  };
};

const swapTokensForExactTokens = (
  tx: TransactionWithLogs,
  deadline: BigInt,
) => {
  return async ([amountOut, amountInMax, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapTokensForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  };
};

const swapExactTokensForTokens = (
  tx: TransactionWithLogs,
  deadline: BigInt,
) => {
  return async ([amountIn, amountOutMin, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapExactTokensForTokens,
      tx,
      deadline,
      path,
      amountIn.toBigInt(),
      'unknown',
    );
  };
};

const swapExactTokensForETH = (tx: TransactionWithLogs, deadline: BigInt) => {
  return async ([amountIn, amountOutMin, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapExactTokensForETH,
      tx,
      deadline,
      path,
      amountIn.toBigInt(),
      'unknown',
    );
  };
};

const swapETHForExactTokens = (tx: TransactionWithLogs, deadline: BigInt) => {
  return async ([amountOut, path, to]: [BigNumber, string[], string]) => {
    await handleSwap(
      UniswapLPSwapMethod.swapETHForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut.toBigInt(),
    );
  };
};
