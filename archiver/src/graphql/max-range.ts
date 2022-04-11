import config, { Config } from './config';

export default function maxRange(
  key: keyof Config['maxBlockRange'],
  startBlock: number,
  endBlock: number
) {
  const range = config.maxBlockRange[key];
  if (endBlock - startBlock > range) {
    throw Error(`Maximum range ${range} blocks`);
  }
}
