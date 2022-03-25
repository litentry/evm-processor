import { BigNumber } from 'ethers';
import _ from 'lodash';
import { UNISWAP } from './constants';
import { handleSwap } from './handle-swap';
import { Log, Transaction, TransactionWithLogs } from './types';
import * as utils from './utils';

const swapMethodIds = UNISWAP.V3_MULTICALL_SWAP_METHODS.map(
  (method) => method.ID
);

/*
    "1. transactions where to_address === 0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45 (uniswap v3)",
    "2. check input starts with 0x5ae401dc multicall(uint256 deadline, bytes[] data)",
    "3. Break down input into individual calls",
    "4. Check calls for relevant method ids e.g. 472b43f3 swapExactTokensForTokens(uint256,uint256,address[],address)",
    "5. Pass matching call inputs into parsers",
    "6. Check we have all the data we need - log to JSON",

    "FORGOT - output is possibly: logs where address is non-exact token and topic0 starts with Withdrawal(address,uint256) 7fcf532c - use data"
    */
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

  return { decodedCalls };
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
    await handleSwap(
      tx.transaction_index,
      tx.hash,
      tx.block_timestamp,
      tx.block_number,
      tx.gas,
      tx.from_address,
      deadline,
      path,
      amountIn.toBigInt(),
      'unknown',
      tx.logs
    );
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
