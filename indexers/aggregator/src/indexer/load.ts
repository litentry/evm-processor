import { utils } from 'indexer-utils';
import {
  ERC1155DailyMarketActivityModel,
  ERC1155MonthlyMarketActivityModel,
  ERC1155YearlyMarketActivityModel,
  ERC721DailyMarketActivityModel,
  ERC721MonthlyMarketActivityModel,
  ERC721YearlyMarketActivityModel,
} from '../schema';
import { TransformedTransfers } from './types';

export default async function load(data: TransformedTransfers): Promise<void> {
  await utils.ensureShardedCollections(
    ERC1155DailyMarketActivityModel,
    ERC1155MonthlyMarketActivityModel,
    ERC1155YearlyMarketActivityModel,
    ERC721DailyMarketActivityModel,
    ERC721MonthlyMarketActivityModel,
    ERC721YearlyMarketActivityModel,
  );

  await Promise.all(
    data.erc721.yearly.map(async (doc) => {
      try {
        await ERC721YearlyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC721YearlyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
  await Promise.all(
    data.erc721.monthly.map(async (doc) => {
      try {
        await ERC721MonthlyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC721MonthlyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
              month: doc.month,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
  await Promise.all(
    data.erc721.daily.map(async (doc) => {
      try {
        await ERC721DailyMarketActivityModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC721DailyMarketActivityModel.findOneAndUpdate(
            {
              year: doc.year,
              month: doc.month,
              day: doc.day,
            },
            {
              $inc: {
                totalTransactions: doc.totalTransactions,
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );

  await Promise.all(
    data.erc1155.yearly.map(async (doc) => {
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
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
  await Promise.all(
    data.erc1155.monthly.map(async (doc) => {
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
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
  await Promise.all(
    data.erc1155.daily.map(async (doc) => {
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
                totalTokens: doc.totalTokens,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
}
