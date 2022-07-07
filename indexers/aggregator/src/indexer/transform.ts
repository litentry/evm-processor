import {
  ExtractedData,
  ExtractedTransfers,
  MarketActivity,
  TransformedTransfers,
} from './types';

export default function transform(
  transactions: ExtractedTransfers,
): TransformedTransfers {
  const dataErc721 = batch(transactions.erc721);
  const dataErc1155 = batch(transactions.erc1155);

  return {
    erc721: {
      yearly: groupBy(['year'], dataErc721).map(
        ({ month, day, ...yearly }) => yearly,
      ),
      monthly: groupBy(['year', 'month'], dataErc721).map(
        ({ day, ...monthly }) => monthly,
      ),
      daily: groupBy(['year', 'month', 'day'], dataErc721),
    },
    erc1155: {
      yearly: groupBy(['year'], dataErc1155).map(
        ({ month, day, ...yearly }) => yearly,
      ),
      monthly: groupBy(['year', 'month'], dataErc1155).map(
        ({ day, ...monthly }) => monthly,
      ),
      daily: groupBy(['year', 'month', 'day'], dataErc1155),
    },
  };
}

function batch(transactions: ExtractedData[]): MarketActivity[] {
  return transactions.map((t) => {
    const blockDate = new Date(t.blockTimestamp * 1000);

    return {
      year: blockDate.getUTCFullYear(),
      month: blockDate.getUTCMonth() + 1,
      day: blockDate.getUTCDate(),
      totalTransactions: t.totalTransactions,
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
      });
      return;
    }

    map.set(index, t);
  });

  return Array.from(map.values());
}
