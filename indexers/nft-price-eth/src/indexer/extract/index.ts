import { ExtractedNFTPriceData } from '../types';
import applyAssociatedData from './apply-associated-data';
import getOpenseaWyvernLogs from './get-opensea-wyvern-logs';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTPriceData> {
  const [openseaV1, openseaV2] = await Promise.all([
    getOpenseaWyvernLogs(startBlock, endBlock, 'V1'),
    getOpenseaWyvernLogs(startBlock, endBlock, 'V2'),
  ]);

  const opensea = await applyAssociatedData(
    [...openseaV1, ...openseaV2],
    startBlock,
    endBlock,
  );

  return {
    opensea,
  };
}
