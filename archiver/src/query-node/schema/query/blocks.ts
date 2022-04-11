import { BlockModel } from '../../../models';
import maxRange from '../../max-range';

export default async function blocks(
  _: any,
  { startBlock, endBlock }: { startBlock: number; endBlock: number }
) {
  maxRange('blocks', startBlock, endBlock);

  const results = await BlockModel.find({
    number: {
      $gte: startBlock,
      $lte: endBlock,
    },
  }).sort('number');

  return results;
}
