import { BigNumber } from 'ethers';
import { Types } from 'indexer-utils';
import { SwapMethod } from '../types';
import transformSwap, { TRANSFER_METHOD_ID } from './transform-swap';

describe('transformSwap()', () => {
  it('Converts transaction data into a Swap model', async () => {
    expect(
      transformSwap(
        SwapMethod.swapETHForExactTokens,
        {
          _id: 'TX_HASH',
          nonce: 1,
          blockHash: '0xblock1',
          blockNumber: 1,
          blockTimestamp: 1517234642,
          transactionIndex: 4,
          from: 'USER',
          value: '0',
          gasPrice: '30000000000',
          gas: '9000',
          receiptStatus: true,
          receiptCumulativeGasUsed: '9000',
          receiptGasUsed: '9000',
          to: 'WETH_CONTRACT',
          input: '0xSomeBinary',
          methodId: '0xSwapETHForExactTokensHash',
          logs: [
            {
              address: 'WETH_CONTRACT',
              topic0: TRANSFER_METHOD_ID,
              data: '0x000A', // 10
            },
            {
              address: 'WETH_CONTRACT',
              topic0: 'IGNORE',
              data: 'IGNORE',
            },
            {
              address: 'WETH_CONTRACT',
              topic0: TRANSFER_METHOD_ID,
              data: '0x001E', // 30
            },
          ] as Types.Archive.Log[],
        },
        BigNumber.from(123),
        ['WETH_CONTRACT', 'INTERMEDIATE_TOKEN', 'TOKEN_CONTRACT'],
        'unknown',
        BigNumber.from(100),
      ),
    ).toStrictEqual({
      _id: 'TX_HASH',
      contract: 'weth_contract',
      address: 'user',
      method: 'swapETHForExactTokens',
      pair: 'weth_contract:token_contract',
      intermediatePath: 'intermediate_token',
      deadline: '123',
      token0: 'weth_contract',
      token1: 'token_contract',
      token0Amount: '40', // 10 + 30 calculated from logs
      token1Amount: '100',
      gas: '9000',
      blockNumber: 1,
      timestamp: 1517234642,
    });
  });
});
