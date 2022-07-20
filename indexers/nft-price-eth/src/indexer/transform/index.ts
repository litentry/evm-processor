import {
  ExtractedMarketplaceData,
  ExtractedNFTPriceData,
  MismatchedTransfers,
  MissingContracts,
  TransformedNFTPriceData,
} from '../types';
import decodeOpenseaSales from './decode-opensea-sales';
import decodeX2Y2Sales from './decode-x2y2-sales';
import { Types } from 'indexer-utils';

export default function transform(
  data: ExtractedNFTPriceData,
): TransformedNFTPriceData {
  const decoders: {
    [x: string]: (data: ExtractedMarketplaceData) => TransformedNFTPriceData;
  } = {
    x2y2: decodeX2Y2Sales,
    opensea: decodeOpenseaSales,
  };
  return Object.entries(data)
    .map(([key, value]) => {
      return decoders[key](value);
    })
    .reduce(
      (currentData, marketPlaceData) => {
        return {
          sales: {
            ...currentData.sales,
            ...marketPlaceData.sales,
          },
          missingContracts: {
            ...currentData.missingContracts,
            ...marketPlaceData.missingContracts,
          },
          mismatchedTransfers: {
            ...currentData.mismatchedTransfers,
            ...marketPlaceData.mismatchedTransfers,
          },
        };
      },
      {
        sales: [] as Types.Nft.Sale[],
        missingContracts: [] as MissingContracts[],
        mismatchedTransfers: [] as MismatchedTransfers[],
      },
    );
}
