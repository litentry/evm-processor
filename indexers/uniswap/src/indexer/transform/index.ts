import { ExtractedData, Swap } from '../types';
import transformMulticall from './transform-multicall';
import transformV2Swaps from './transform-v2-swaps';

export default function transform({ v2, v3 }: ExtractedData) {
  const v2Swaps = v2.flatMap((item) =>
    item.txs.map((tx) => transformV2Swaps[item.method](tx)),
  );
  const v3Swaps = v3
    .map((tx) => transformMulticall(tx))
    .filter((swap) => swap) as Swap[];

  return [...v2Swaps, ...v3Swaps];
}
