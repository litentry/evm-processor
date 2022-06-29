import { Types } from 'indexer-utils';
import transform from './transform';
import { MarketActivity } from './types';

const transaction1 = {
  hash: '',
  nonce: 0,
  blockHash: '',
  blockNumber: 1243141,
  blockTimestamp: 1656494143,
  transactionIndex: 0,
  from: '',
  value: '100',
  gasPrice: '',
  gas: '',
  receiptCumulativeGasUsed: '',
  receiptGasUsed: '',
} as Types.Archive.ContractTransactionWithLogs;

const transaction2 = {
  hash: '',
  nonce: 0,
  blockHash: '',
  blockNumber: 1243141,
  blockTimestamp: 1622505600,
  transactionIndex: 0,
  from: '',
  value: '200',
  gasPrice: '',
  gas: '',
  receiptCumulativeGasUsed: '',
  receiptGasUsed: '',
} as Types.Archive.ContractTransactionWithLogs;

const transaction3 = {
  hash: '',
  nonce: 0,
  blockHash: '',
  blockNumber: 1243141,
  blockTimestamp: 1654041600,
  transactionIndex: 0,
  from: '',
  value: '300',
  gasPrice: '',
  gas: '',
  receiptCumulativeGasUsed: '',
  receiptGasUsed: '',
} as Types.Archive.ContractTransactionWithLogs;

const transaction4 = {
  hash: '',
  nonce: 0,
  blockHash: '',
  blockNumber: 1243141,
  blockTimestamp: 1656374400,
  transactionIndex: 0,
  from: '',
  value: '400',
  gasPrice: '',
  gas: '',
  receiptCumulativeGasUsed: '',
  receiptGasUsed: '',
} as Types.Archive.ContractTransactionWithLogs;

describe('transform', () => {
  const result = transform([
    transaction1,
    transaction2,
    transaction3,
    transaction4,
  ]);

  it('Should transform the existing transactions', () => {
    expect(sort(result.yearly)).toStrictEqual([
      { year: 2021, totalTransactions: 1, totalAmount: 200 },
      { year: 2022, totalTransactions: 3, totalAmount: 800 },
    ]);

    expect(sort(result.monthly)).toStrictEqual([
      { year: 2021, month: 6, totalTransactions: 1, totalAmount: 200 },
      { year: 2022, month: 6, totalTransactions: 3, totalAmount: 800 },
    ]);

    expect(sort(result.daily)).toStrictEqual([
      {
        year: 2021,
        month: 6,
        day: 1,
        totalTransactions: 1,
        totalAmount: 200,
      },
      {
        year: 2022,
        month: 6,
        day: 1,
        totalTransactions: 1,
        totalAmount: 300,
      },
      {
        year: 2022,
        month: 6,
        day: 28,
        totalTransactions: 1,
        totalAmount: 400,
      },
      {
        year: 2022,
        month: 6,
        day: 29,
        totalTransactions: 1,
        totalAmount: 100,
      },
    ]);
  });
});

function sort(arr: MarketActivity[]) {
  return arr.sort((a, b) => {
    return (
      a.year - b.year ||
      (a.month && b.month ? a.month - b.month : 0) ||
      (a.day && b.day ? a.day - b.day : 0)
    );
  });
}
