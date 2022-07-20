import { ExtractedNFTPriceData } from '../types';
import applyAssociatedData from './apply-associated-data';
import getOpenseaWyvernLogs from './get-opensea-wyvern-logs';
import getX2Y2Logs from './get-x2y2-logs';
import * as util from 'util';

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedNFTPriceData> {
  const [openseaV1, openseaV2, x2y2V1] = await Promise.all([
    getOpenseaWyvernLogs(startBlock, endBlock, 'V1'),
    getOpenseaWyvernLogs(startBlock, endBlock, 'V2'),
    getX2Y2Logs(startBlock, endBlock),
  ]);

  const opensea = await applyAssociatedData(
    [...openseaV1, ...openseaV2],
    startBlock,
    endBlock,
  );

  const x2y2 = await applyAssociatedData([...x2y2V1], startBlock, endBlock);

  return {
    opensea,
    x2y2,
  };
}
