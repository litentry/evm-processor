import { Types, utils } from 'indexer-utils';
import { BigNumber, ethers } from 'ethers';
import transformSwap from './transform-swap';
import { Swap, SwapMethod } from '../types';

function getParams(method: SwapMethod) {
  const item = utils.contract.CONTRACT_SIGNATURES.UNISWAPV2.EXTRINSICS.find(
    (sig) => sig.SIGNATURE.split('(')[0] === method,
  );
  if (!item) {
    throw Error('method unknown');
  }
  return item.PARAMS;
}

const handlers: {
  [key in SwapMethod]: (tx: Types.Archive.ContractTransactionWithLogs) => Swap;
} = {
  [SwapMethod.swapTokensForExactETH]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapTokensForExactETH);

    const [amountOut, amountInMax, path, to, deadline] =
      ethers.utils.defaultAbiCoder.decode(
        params,
        ethers.utils.hexDataSlice(tx.input, 4),
      ) as [BigNumber, BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapTokensForExactETH,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );
  },
  [SwapMethod.swapExactETHForTokens]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapExactETHForTokens);

    const [amountOutMin, path, to, deadline] =
      ethers.utils.defaultAbiCoder.decode(
        params,
        ethers.utils.hexDataSlice(tx.input, 4),
      ) as [BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapExactETHForTokens,
      tx,
      deadline,
      path,
      BigNumber.from(tx.value),
      'unknown',
    );
  },
  [SwapMethod.swapTokensForExactTokens]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapTokensForExactTokens);

    const [amountOut, amountInMax, path, to, deadline] =
      ethers.utils.defaultAbiCoder.decode(
        params,
        ethers.utils.hexDataSlice(tx.input, 4),
      ) as [BigNumber, BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapTokensForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );
  },
  [SwapMethod.swapExactTokensForTokens]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapExactTokensForTokens);

    const [amountIn, amountOutMin, path, to, deadline] =
      ethers.utils.defaultAbiCoder.decode(
        params,
        ethers.utils.hexDataSlice(tx.input, 4),
      ) as [BigNumber, BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapExactTokensForTokens,
      tx,
      deadline,
      path,
      amountIn,
      'unknown',
    );
  },
  [SwapMethod.swapExactTokensForETH]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapExactTokensForETH);

    const [amountIn, amountOutMin, path, to, deadline] =
      ethers.utils.defaultAbiCoder.decode(
        params,
        ethers.utils.hexDataSlice(tx.input, 4),
      ) as [BigNumber, BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapExactTokensForETH,
      tx,
      deadline,
      path,
      amountIn,
      'unknown',
    );
  },
  [SwapMethod.swapETHForExactTokens]: (
    tx: Types.Archive.ContractTransactionWithLogs,
  ) => {
    const params = getParams(SwapMethod.swapETHForExactTokens);

    const [amountOut, path, to, deadline] = ethers.utils.defaultAbiCoder.decode(
      params,
      ethers.utils.hexDataSlice(tx.input, 4),
    ) as [BigNumber, string[], string, BigNumber];

    return transformSwap(
      SwapMethod.swapETHForExactTokens,
      tx,
      deadline,
      path,
      'unknown',
      amountOut,
    );
  },
};

export default handlers;
