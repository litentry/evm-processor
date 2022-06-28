import transformV2Swaps from './transform-v2-swaps';
import transformMulticall from './transform-multicall';
import { ExtractedData, Swap } from '../types';

export default function transform({ v2, v3 }: ExtractedData) {
  const v2Swaps = v2.map((item) => transformV2Swaps[item.method](item.txs[0]));
  const v3Swaps = v3
    .map((tx) => transformMulticall(tx))
    .filter((swap) => swap) as Swap[];

  return [...v2Swaps, ...v3Swaps];
}
