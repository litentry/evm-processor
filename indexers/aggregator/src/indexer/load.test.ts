import {
  ERC1155DailyMarketActivityModel,
  ERC1155MonthlyMarketActivityModel,
  ERC1155YearlyMarketActivityModel,
  ERC721DailyMarketActivityModel,
  ERC721MonthlyMarketActivityModel,
  ERC721YearlyMarketActivityModel,
} from '../schema';
import load from './load';
import { MarketActivity } from './types';

const transformed = {
  erc721: {
    yearly: [
      { year: 2021, totalTransactions: 2, totalTokens: 2 },
      { year: 2022, totalTransactions: 1, totalTokens: 1 },
    ],
    monthly: [
      { year: 2021, month: 6, totalTransactions: 2, totalTokens: 2 },
      { year: 2022, month: 6, totalTransactions: 1, totalTokens: 1 },
    ],
    daily: [
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
    ],
  },
  erc1155: {
    yearly: [{ year: 2021, totalTransactions: 2, totalTokens: 6 }],
    monthly: [{ year: 2021, month: 6, totalTransactions: 2, totalTokens: 6 }],
    daily: [
      {
        year: 2021,
        month: 6,
        day: 1,
        totalTransactions: 2,
        totalTokens: 6,
      },
    ],
  },
};

describe('load', () => {
  it('Ensures we load the models into the DB', async () => {
    await ERC1155DailyMarketActivityModel.createIndexes();
    await ERC1155MonthlyMarketActivityModel.createIndexes();
    await ERC1155YearlyMarketActivityModel.createIndexes();
    await ERC721DailyMarketActivityModel.createIndexes();
    await ERC721MonthlyMarketActivityModel.createIndexes();
    await ERC721YearlyMarketActivityModel.createIndexes();

    await load(transformed);

    const resultsErc721Yearly = await ERC721YearlyMarketActivityModel.find({});
    expect(
      sort(resultsErc721Yearly).map((doc) => ({
        year: doc.year,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc721.yearly);

    const resultsErc721Monthly = await ERC721MonthlyMarketActivityModel.find(
      {},
    );
    expect(
      sort(resultsErc721Monthly).map((doc) => ({
        year: doc.year,
        month: doc.month,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc721.monthly);

    const resultsErc721Daily = await ERC721DailyMarketActivityModel.find({});
    expect(
      sort(resultsErc721Daily).map((doc) => ({
        year: doc.year,
        month: doc.month,
        day: doc.day,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc721.daily);

    const results1155Yearly = await ERC1155YearlyMarketActivityModel.find({});
    expect(
      sort(results1155Yearly).map((doc) => ({
        year: doc.year,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc1155.yearly);

    const results1155Monthly = await ERC1155MonthlyMarketActivityModel.find({});
    expect(
      sort(results1155Monthly).map((doc) => ({
        year: doc.year,
        month: doc.month,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc1155.monthly);

    const results1155Daily = await ERC1155DailyMarketActivityModel.find({});
    expect(
      sort(results1155Daily).map((doc) => ({
        year: doc.year,
        month: doc.month,
        day: doc.day,
        totalTransactions: doc.totalTransactions,
        totalTokens: doc.totalTokens,
      })),
    ).toStrictEqual(transformed.erc1155.daily);
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
