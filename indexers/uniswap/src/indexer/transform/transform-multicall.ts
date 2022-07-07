import { BigNumber, ethers } from 'ethers';
import { Types, utils } from 'indexer-utils';
import { Swap, SwapMethod } from '../types';
import { filterCalls, findMethodsInInput, getMethodIdFromCall } from '../utils';
import transformSwap from './transform-swap';

const EXTRINSICS = utils.contract.CONTRACT_SIGNATURES.UNISWAPV3.EXTRINSICS;

const swapMethodIds = EXTRINSICS.filter(
  (ex) => ex.SIGNATURE !== 'multicall(uint256,bytes[])',
).map((method) => method.ID);

export default function transformMulticall(
  tx: Types.Archive.ContractTransactionWithLogs,
): Swap | undefined {
  const swapMethodsCalled = findMethodsInInput(tx.input, swapMethodIds);
  if (!swapMethodsCalled.length) {
    return;
  }

  const [deadline, calls] = ethers.utils.defaultAbiCoder.decode(
    EXTRINSICS[0].PARAMS,
    ethers.utils.hexDataSlice(tx.input, 4),
  ) as [BigNumber, string[]];

  const relevantCalls = filterCalls(calls, swapMethodsCalled);

  const decodedCalls: {
    methodName: string;
    decoded: any[];
  }[] = [];

  relevantCalls.forEach((call) => {
    const methodId = getMethodIdFromCall(call);

    const CONSTS = EXTRINSICS.find((ex) => ex.ID === methodId)!;

    decodedCalls.push({
      methodName: CONSTS.SIGNATURE.split('(')[0],
      decoded: ethers.utils.defaultAbiCoder.decode(
        CONSTS.PARAMS,
        ethers.utils.hexDataSlice(call, 4),
      ) as any[],
    });
  });

  for (let i = 0; i < decodedCalls.length; i++) {
    switch (decodedCalls[i].methodName) {
      case SwapMethod.swapTokensForExactETH: {
        return swapTokensForExactETH(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
      }
      case SwapMethod.swapExactETHForTokens: {
        return swapExactETHForTokens(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, string[], string]);
      }
      case SwapMethod.swapTokensForExactTokens: {
        return swapTokensForExactTokens(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
      }
      case SwapMethod.swapExactTokensForTokens: {
        return swapExactTokensForTokens(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
      }
      case SwapMethod.swapExactTokensForETH: {
        return swapExactTokensForETH(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
      }
      case SwapMethod.swapETHForExactTokens: {
        return swapETHForExactTokens(
          { ...tx, _id: `${tx._id}.${i}` },
          deadline,
        )(decodedCalls[i].decoded as [BigNumber, string[], string]);
      }
      default: {
        throw new Error(`Method ${decodedCalls[i].methodName} missing`);
      }
    }
  }
}

const swapTokensForExactETH =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountOut, amountInMax, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) =>
    transformSwap(
      SwapMethod.swapTokensForExactETH,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );

const swapExactETHForTokens =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountOutMin, path, to]: [BigNumber, string[], string]) =>
    transformSwap(
      SwapMethod.swapExactETHForTokens,
      tx,
      deadline,
      path,
      BigNumber.from(tx.value),
      'unknown',
    );

const swapTokensForExactTokens =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountOut, amountInMax, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) =>
    transformSwap(
      SwapMethod.swapTokensForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );

const swapExactTokensForTokens =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountIn, amountOutMin, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) =>
    transformSwap(
      SwapMethod.swapExactTokensForTokens,
      tx,
      deadline,
      path,
      amountIn,
      'unknown',
    );

const swapExactTokensForETH =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountIn, amountOutMin, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string,
  ]) =>
    transformSwap(
      SwapMethod.swapExactTokensForETH,
      tx,
      deadline,
      path,
      amountIn,
      'unknown',
    );

const swapETHForExactTokens =
  (tx: Types.Archive.ContractTransactionWithLogs, deadline: BigNumber) =>
  ([amountOut, path, to]: [BigNumber, string[], string]) =>
    transformSwap(
      SwapMethod.swapETHForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );
