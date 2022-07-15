import { ExtractedNFTPriceData, TransformedNFTPriceData } from '../types';
import decodeOpenseaSales from './decode-opensea-sales';
export default function transform(
  data: ExtractedNFTPriceData,
): TransformedNFTPriceData {
  const { sales, missingContracts, mismatchedTransfers } =
    decodeOpenseaSales(data);

  return { sales, missingContracts, mismatchedTransfers };
}
