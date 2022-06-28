import { BigNumber } from 'ethers';
import { ExtractedBlock } from '../types';
import ankr from './ankr';
import nodereal from './nodereal';
import standard from './standard';

jest.mock('indexer-monitoring', () => ({
  metrics: { rpcCalls: [] },
  monitoring: { observe: () => {} },
}));
const number = 1000000;

describe('extract block', () => {
  it.skip('should return the same regardless of API', async () => {
    process.env.RPC_ENDPOINT = 'https://rpc.ankr.com/multichain';
    process.env.CHAIN = 'bsc';
    const ankrResult = await ankr(number);
    process.env.RPC_ENDPOINT = 'https://bsc-mainnet.nodereal.io/v1/KEY_HERE';
    const noderealResult = await nodereal(number);
    const standardResult = await standard(number);

    expect(sort(ankrResult)).toStrictEqual(sort(noderealResult));
    expect(sort(standardResult)).toStrictEqual(sort(noderealResult));
  });
});

function sort(data: ExtractedBlock): ExtractedBlock {
  return {
    blockWithTransactions: {
      ...data.blockWithTransactions,
      transactions: data.blockWithTransactions.transactions.sort((a, b) => {
        return (
          BigNumber.from(a.transactionIndex).toNumber() -
          BigNumber.from(b.transactionIndex).toNumber()
        );
      }),
    },
    receipts: data.receipts
      .sort((a, b) => {
        return (
          BigNumber.from(a.transactionIndex).toNumber() -
          BigNumber.from(b.transactionIndex).toNumber()
        );
      })
      .map((r) => ({
        ...r,
        logsBloom: '0x00', // ankr doesn't give this, and we dont use it anyway
      })),
  };
}
