import _ from 'lodash';
import { BigNumber } from 'ethers';
import { TransactionWithLogs, utils } from 'processor';
import { UNISWAP } from './constants';
import { handleSwap } from './handle-swap';

const swapMethodIds = UNISWAP.V3_MULTICALL_SWAP_METHODS.map(
  (method) => method.ID
);

export default async function handleMulticall(tx: TransactionWithLogs) {
  const swapMethodsCalled = utils.findMethodsInInput(tx.input, swapMethodIds);
  if (!swapMethodsCalled.length) {
    return;
  }

  const [deadline, calls] = utils.decodeCall(
    tx.input,
    UNISWAP.V3_MULTICALL.PARAMS
  );
  const relevantCalls = utils.filterCalls(calls, swapMethodsCalled);

  const decodedCalls: {
    methodName: string;
    decoded: any[];
  }[] = [];

  relevantCalls.forEach((call) => {
    const methodId = utils.getMethodIdFromCall(call);

    const CONSTS = UNISWAP.V3_MULTICALL_SWAP_METHODS.find(
      (method) => method.ID === methodId
    )!;

    decodedCalls.push({
      methodName: CONSTS.NAME,
      decoded: utils.decodeCall(call, CONSTS.PARAMS) as any[],
    });
  });

  for (let i = 0; i < decodedCalls.length; i++) {
    switch (decodedCalls[i].methodName) {
      case 'swapExactTokensForTokens': {
        await swapExactTokensForTokens(
          tx,
          deadline.toBigInt()
        )(decodedCalls[i].decoded as [BigNumber, BigNumber, string[], string]);
        break;
      }
      default: {
        console.log(decodedCalls[i].methodName);
        // throw new Error(`Method ${decodedCalls[i].methodName} missing`);
      }
    }
  }

  // return { decodedCalls };
}

const swapTokensForExactETH = async ([amountOut, amountInMax, path, to]: [
  BigNumber,
  BigNumber,
  string[],
  string
]) => {};

const swapExactETHForTokens = async ([amountOutMin, path, to]: [
  BigNumber,
  string[],
  string
]) => {
  // msg.value is exactETH
};

const swapTokensForExactTokens = async ([amountOut, amountInMax, path, to]: [
  BigNumber,
  BigNumber,
  string[],
  string
]) => {};

const swapExactTokensForTokens =
  (tx: TransactionWithLogs, deadline: BigInt) =>
  async ([amountIn, amountOutMin, path, to]: [
    BigNumber,
    BigNumber,
    string[],
    string
  ]) => {
    await handleSwap(tx, deadline, path, amountIn.toBigInt(), 'unknown');
  };

const swapExactTokensForETH = async ([amountIn, amountOutMin, path, to]: [
  BigNumber,
  BigNumber,
  string[],
  string
]) => {};

const swapETHForExactTokens = async ([amountOut, path, to]: [
  BigNumber,
  string[],
  string
]) => {
  // msg.value amountInMax
};
