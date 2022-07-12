import transform from './transform';
import { MarketActivity } from './types';

const transfers = {
  erc721: [
    { blockTimestamp: 1656494143, totalTransactions: 1, totalTokens: 1 },
    { blockTimestamp: 1622505600, totalTransactions: 1, totalTokens: 1 },
    { blockTimestamp: 1622505600, totalTransactions: 1, totalTokens: 1 },
  ],
  erc1155: [
    { blockTimestamp: 1622505600, totalTransactions: 1, totalTokens: 2 },
    { blockTimestamp: 1622505600, totalTransactions: 1, totalTokens: 4 },
  ],
};

describe('transform', () => {
  const result = transform(transfers);

  it('Should transform the existing transactions', () => {
    expect(sort(result.erc721.yearly)).toStrictEqual([
      { year: 2021, totalTransactions: 2, totalTokens: 2 },
      { year: 2022, totalTransactions: 1, totalTokens: 1 },
    ]);

    expect(sort(result.erc721.monthly)).toStrictEqual([
      { year: 2021, month: 6, totalTransactions: 2, totalTokens: 2 },
      { year: 2022, month: 6, totalTransactions: 1, totalTokens: 1 },
    ]);

    expect(sort(result.erc721.daily)).toStrictEqual([
      {
        year: 2021,
        month: 6,
        day: 1,
        totalTransactions: 2,
        totalTokens: 2,
      },
      {
        year: 2022,
        month: 6,
        day: 29,
        totalTransactions: 1,
        totalTokens: 1,
      },
    ]);

    expect(sort(result.erc1155.yearly)).toStrictEqual([
      { year: 2021, totalTransactions: 2, totalTokens: 6 },
    ]);

    expect(sort(result.erc1155.monthly)).toStrictEqual([
      { year: 2021, month: 6, totalTransactions: 2, totalTokens: 6 },
    ]);

    expect(sort(result.erc1155.daily)).toStrictEqual([
      {
        year: 2021,
        month: 6,
        day: 1,
        totalTransactions: 2,
        totalTokens: 6,
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
