import { processor } from "./processor";
import { ProcessorConfig } from "./types";
import { queryChainHeight } from "./archive-queries";
import { waitSeconds } from "./utils";

const pollWait = 5;

/**
 * Polls the archive for the current chain height to index up to
 * @param config
 */
export async function daemon (config: ProcessorConfig) {
  let lastHeight = 0;
  for (; ;) {
    const currentHeight = await queryChainHeight();
    if (currentHeight > lastHeight) {
      console.log('Current chain height:', currentHeight);
      await processor({
        ...config,
        endBlock: currentHeight
      });
      lastHeight = currentHeight;
    }
    console.log(`Processor finished at current height ${currentHeight}, sleeping for ${pollWait}s...`);
    await waitSeconds(pollWait);
  }
}

export default daemon;
