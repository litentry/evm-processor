export type Metric = {
  functionName: string;
};

export type Metrics = {
  [name: string]: Metric;
};

const metrics: Metrics = {
  extractBlock: {
    functionName: 'extract-block',
  },
  transformBlock: {
    functionName: 'transform-block',
  },
  loadBlock: {
    functionName: 'load-block',
  },
  fullWorkerProcess: {
    functionName: 'full-worker-process',
  },
  getLastQueuedBlock: {
    functionName: 'get-last-queued-block',
  },
  batchBlocks: {
    functionName: 'batch-blocks',
  },
  saveLastQueuedBlock: {
    functionName: 'save-last-queued-block',
  },
};

export default metrics;
