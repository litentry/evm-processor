export type Metric = {
  functionName: string;
};

export type Metrics = {
  [name: string]: Metric;
};

const metrics: Metrics = {
  extractBlock: {
    functionName: 'extract_block',
  },
  transformBlock: {
    functionName: 'transform_block',
  },
  loadBlock: {
    functionName: 'load_block',
  },
  fullWorkerProcess: {
    functionName: 'full_worker_process',
  },
  getLastQueuedBlock: {
    functionName: 'get_last_queued_block',
  },
  lastQueuedBlock: {
    functionName: 'last_queued_block',
  },
  batchBlocks: {
    functionName: 'batch_blocks',
  },
  saveLastQueuedBlock: {
    functionName: 'save_last_queued_block',
  },
  rpcCalls: {
    functionName: 'rpc_calls',
  },
};

export default metrics;
