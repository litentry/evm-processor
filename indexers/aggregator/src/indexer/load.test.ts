import {
  ERC1155DailyMarketActivityModel,
  ERC1155MonthlyMarketActivityModel,
  ERC1155YearlyMarketActivityModel,
} from '../schema';
import load from './load';
import { MarketActivity } from './types';

const transformed = {
  yearly: [
    { year: 2021, totalTransactions: 1, totalAmount: 200 },
    { year: 2022, totalTransactions: 3, totalAmount: 800 },
  ],
  monthly: [
    { year: 2021, month: 6, totalTransactions: 1, totalAmount: 200 },
    { year: 2022, month: 6, totalTransactions: 3, totalAmount: 800 },
  ],
  daily: [
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
  ],
};

describe('load', () => {
  it('Ensures we load the models into the DB', async () => {
    await ERC1155DailyMarketActivityModel.createIndexes();
    await ERC1155MonthlyMarketActivityModel.createIndexes();
    await ERC1155YearlyMarketActivityModel.createIndexes();

    await load(transformed);

    const resultsYearly = await ERC1155YearlyMarketActivityModel.find({});
    expect(
      sort(resultsYearly).map((doc) => ({
        year: doc.year,
        totalTransactions: doc.totalTransactions,
        totalAmount: doc.totalAmount,
      })),
    ).toStrictEqual(transformed.yearly);

    const resultsMonthly = await ERC1155MonthlyMarketActivityModel.find({});
    expect(
      sort(resultsMonthly).map((doc) => ({
        year: doc.year,
        month: doc.month,
        totalTransactions: doc.totalTransactions,
        totalAmount: doc.totalAmount,
      })),
    ).toStrictEqual(transformed.monthly);

    const resultsDaily = await ERC1155DailyMarketActivityModel.find({});
    expect(
      sort(resultsDaily).map((doc) => ({
        year: doc.year,
        month: doc.month,
        day: doc.day,
        totalTransactions: doc.totalTransactions,
        totalAmount: doc.totalAmount,
      })),
    ).toStrictEqual(transformed.daily);
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
