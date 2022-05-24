export type BatchHandler = (
  batchStartBlock: number,
  batchEndBlock: number,
) => Promise<void>;
