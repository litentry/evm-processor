import { schemaComposer } from 'graphql-compose';
import { Types } from 'indexer-utils';
import mongoose from 'mongoose';

/**
 * Base Aggregator
 */
interface BaseAggregatorDocument
  extends Types.Aggregator.BaseAggregator,
    mongoose.Document {}

export const BaseAggregatorSchema = new mongoose.Schema<BaseAggregatorDocument>(
  {
    lastAggregatedBlockNumber: { type: Number, required: true },
    lastAggregatedAt: { type: Date, required: true },
  },
);

export const BaseAggregatorModel = mongoose.model(
  'baseAggregator',
  BaseAggregatorSchema,
);

export const get =
  async (): Promise<Types.Aggregator.BaseAggregator | null> => {
    const currentValue = await BaseAggregatorModel.findOne({}).exec();
    if (!currentValue) {
      return null;
    }
    return currentValue.get(
      'baseAggregator',
    ) as Types.Aggregator.BaseAggregator;
  };

export const save = async (
  lastAggregatedBlockNumber: number,
  lastAggregatedAt: Date,
): Promise<void> => {
  const currentValue = await BaseAggregatorModel.findOne().exec();

  if (!currentValue) {
    await BaseAggregatorModel.create({
      lastAggregatedBlockNumber,
      lastAggregatedAt,
    });
    return;
  }

  await currentValue.updateOne({ lastAggregatedBlockNumber, lastAggregatedAt });
};

/**
 * ERC 721
 */
interface ERC721DailyMarketActivityDocument
  extends Types.Aggregator.ERC721DailyMarketActivity,
    mongoose.Document {}
interface ERC721MonthlyMarketActivityDocument
  extends Types.Aggregator.ERC721MonthlyMarketActivity,
    mongoose.Document {}
interface ERC721YearlyMarketActivityDocument
  extends Types.Aggregator.ERC721YearlyMarketActivity,
    mongoose.Document {}

export const ERC721DailyMarketActivitySchema =
  new mongoose.Schema<ERC721DailyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    day: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });
export const ERC721MonthlyMarketActivitySchema =
  new mongoose.Schema<ERC721MonthlyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });
export const ERC721YearlyMarketActivitySchema =
  new mongoose.Schema<ERC721DailyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });

export const ERC721DailyMarketActivityModel = mongoose.model(
  'ERC721DailyMarketActivity',
  ERC721DailyMarketActivitySchema,
);

export const ERC721MonthlyMarketActivityModel = mongoose.model(
  'ERC721MonthlyMarketActivity',
  ERC721MonthlyMarketActivitySchema,
);

export const ERC721YearlyMarketActivityModel = mongoose.model(
  'ERC721YearlyMarketActivity',
  ERC721YearlyMarketActivitySchema,
);

/**
 * ERC 1155
 */
interface ERC1155DailyMarketActivityDocument
  extends Types.Aggregator.ERC1155DailyMarketActivity,
    mongoose.Document {}
interface ERC1155MonthlyMarketActivityDocument
  extends Types.Aggregator.ERC1155MonthlyMarketActivity,
    mongoose.Document {}
interface ERC1155YearlyMarketActivityDocument
  extends Types.Aggregator.ERC1155YearlyMarketActivity,
    mongoose.Document {}

export const ERC1155DailyMarketActivitySchema =
  new mongoose.Schema<ERC1155DailyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    day: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });
export const ERC1155MonthlyMarketActivitySchema =
  new mongoose.Schema<ERC1155MonthlyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });
export const ERC1155YearlyMarketActivitySchema =
  new mongoose.Schema<ERC1155DailyMarketActivityDocument>({
    year: { type: Number, required: true, index: true },
    totalTransactions: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  });

export const ERC1155DailyMarketActivityModel = mongoose.model(
  'ERC1155DailyMarketActivity',
  ERC1155DailyMarketActivitySchema,
);

export const ERC1155MonthlyMarketActivityModel = mongoose.model(
  'ERC1155MonthlyMarketActivity',
  ERC1155MonthlyMarketActivitySchema,
);

export const ERC1155YearlyMarketActivityModel = mongoose.model(
  'ERC1155YearlyMarketActivity',
  ERC1155YearlyMarketActivitySchema,
);

export default schemaComposer.buildSchema();
