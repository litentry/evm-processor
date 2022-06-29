import { utils } from 'indexer-utils';
import {
  ERC1155DailyMarketActivityModel,
  ERC1155MonthlyMarketActivityModel,
  ERC1155YearlyMarketActivityModel,
} from '../schema';
import { MarketActivity } from './types';

export default async function load(data: {
  yearly: MarketActivity[];
  monthly: MarketActivity[];
  daily: MarketActivity[];
}): Promise<void> {
  await utils.ensureShardedCollections(
    ERC1155DailyMarketActivityModel,
    ERC1155MonthlyMarketActivityModel,
    ERC1155YearlyMarketActivityModel,
  );

  await Promise.all([
    data.yearly.map(async (doc) => {
      try {
        await ERC1155YearlyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC1155YearlyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalAmount: doc.totalAmount,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
    data.monthly.map(async (doc) => {
      try {
        await ERC1155MonthlyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC1155MonthlyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
              month: doc.month,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalAmount: doc.totalAmount,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
    data.daily.map(async (doc) => {
      try {
        await ERC1155DailyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC1155DailyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
              month: doc.month,
              day: doc.day,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalAmount: doc.totalAmount,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  ]);
}
