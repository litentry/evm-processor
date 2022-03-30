import 'dotenv/config';
import { processor, TransactionWithLogs } from 'processor';
import handleMulticall from './handle-multicall';
import dataSource from './data-source';
import { UNISWAP } from './constants';
import v2SwapMethods from './v2-swap-methods';
import { UniswapLPSwapMethod } from './model';

async function run() {
  await dataSource.initialize();

  // v2 deployment 10207858
  processor({
    startBlock: 14389625,
    batchSize: 10,
    contracts: {
      // [UNISWAP.V3_CONTRACT_ADDRESS]: {
      //   [UNISWAP.V3_MULTICALL.SIGNATURE]: handleMulticall,
      // },
      [UNISWAP.V2_CONTRACT_ADDRESS]: UNISWAP.V2_SWAP_METHODS.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.SIGNATURE]: v2SwapMethods[curr.NAME as UniswapLPSwapMethod],
        }),
        {} as { [method: string]: (tx: TransactionWithLogs) => Promise<void> }
      ),
    },
  });
}

run();
