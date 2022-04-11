import { BlockModel } from '../../../models';

export default async function latestBlock() {
  const results = await BlockModel.find({})
    .select({ number: 1 })
    .sort('-number')
    .limit(1);

  return results[0]?.number;
}
