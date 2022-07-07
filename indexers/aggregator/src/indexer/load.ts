import { TransformedTransfers } from './types';

export default async function load(data: TransformedTransfers): Promise<void> {
  // await utils.ensureShardedCollections(
  //   ERC1155DailyMarketActivityModel,
  //   ERC1155MonthlyMarketActivityModel,
  //   ERC1155YearlyMarketActivityModel,
  // );

  console.log(data);
  // await Promise.all(
  //   data.yearly.map(async (doc) => {
  //     try {
  //       await ERC1155YearlyMarketActivityModel.create(doc);
  //     } catch (e) {
  //       if (
  //         (e as Error).message.startsWith(
  //           'E11000 duplicate key error collection',
  //         )
  //       ) {
  //         await ERC1155YearlyMarketActivityModel.findOneAndUpdate(
  //           {
  //             year: doc.year,
  //           },
  //           {
  //             $inc: {
  //               totalTransactions: doc.totalTransactions,
  //               totalAmount: doc.totalAmount,
  //             },
  //           },
  //         );
  //       } else {
  //         throw e;
  //       }
  //     }
  //   }),
  // );
  // await Promise.all(
  //   data.monthly.map(async (doc) => {
  //     try {
  //       await ERC1155MonthlyMarketActivityModel.create(doc);
  //     } catch (e) {
  //       if (
  //         (e as Error).message.startsWith(
  //           'E11000 duplicate key error collection',
  //         )
  //       ) {
  //         await ERC1155MonthlyMarketActivityModel.findOneAndUpdate(
  //           {
  //             year: doc.year,
  //             month: doc.month,
  //           },
  //           {
  //             $inc: {
  //               totalTransactions: doc.totalTransactions,
  //               totalAmount: doc.totalAmount,
  //             },
  //           },
  //         );
  //       } else {
  //         throw e;
  //       }
  //     }
  //   }),
  // );
  // await Promise.all(
  //   data.daily.map(async (doc) => {
  //     try {
  //       await ERC1155DailyMarketActivityModel.create(doc);
  //     } catch (e) {
  //       if (
  //         (e as Error).message.startsWith(
  //           'E11000 duplicate key error collection',
  //         )
  //       ) {
  //         await ERC1155DailyMarketActivityModel.findOneAndUpdate(
  //           {
  //             year: doc.year,
  //             month: doc.month,
  //             day: doc.day,
  //           },
  //           {
  //             $inc: {
  //               totalTransactions: doc.totalTransactions,
  //               totalAmount: doc.totalAmount,
  //             },
  //           },
  //         );
  //       } else {
  //         throw e;
  //       }
  //     }
  //   }),
  // );
}
