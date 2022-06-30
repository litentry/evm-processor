import { Types } from 'indexer-utils';
import { MarketActivity } from './types';

export default function transform(
  transactions: Types.Archive.ContractTransaction[],
): {
  yearly: MarketActivity[];
  monthly: MarketActivity[];
  daily: MarketActivity[];
} {
  const data = batch(transactions);

  return {
    yearly: groupBy(['year'], data).map(({ month, day, ...yearly }) => yearly),
    monthly: groupBy(['year', 'month'], data).map(
      ({ day, ...monthly }) => monthly,
    ),
    daily: groupBy(['year', 'month', 'day'], data),
  };
}

function batch(
  transactions: Types.Archive.ContractTransaction[],
): MarketActivity[] {
  return transactions.map((t) => {
    const blockDate = new Date(t.blockTimestamp * 1000);

    return {
      year: blockDate.getUTCFullYear(),
      month: blockDate.getUTCMonth() + 1,
      day: blockDate.getUTCDate(),
      totalTransactions: 1,
      totalAmount: parseInt(t.value), // I know it's not this, just to prove a point
    };
  });
}

function groupBy(
  groupByFields: string[],
  data: MarketActivity[],
): MarketActivity[] {
  const map = new Map();
  data.forEach((t) => {
    const index = groupByFields.reduce((acc, f) => {
      if (t[f as keyof MarketActivity] === undefined) {
        return acc;
      }
      return `${acc}.${t[f as keyof MarketActivity]}`;
    }, '');
    const current = map.get(index);
    if (current) {
      map.set(index, {
        ...current,
        totalTransactions: t.totalTransactions + current.totalTransactions,
        totalAmount: t.totalAmount + current.totalAmount,
      });
      return;
    }

    map.set(index, t);
  });

  return Array.from(map.values());
}
