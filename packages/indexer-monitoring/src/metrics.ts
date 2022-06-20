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
  lastIndexedBlock: {
    functionName: 'last_indexed_block',
  },
  lastChainBlock: {
    functionName: 'last_chain_block',
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
  lambdaWorkerSuccess: {
    functionName: 'lambda_worker_success',
  },
  lambdaWorkerFailure: {
    functionName: 'lambda_worker_failure',
  },
  lambdaWorkerSuccessfulBatches: {
    functionName: 'lambda_worker_successful_batches',
  },
  lambdaWorkerFailedBatches: {
    functionName: 'lambda_worker_failed_batches',
  },
  lambdaWorkerMaxWorkers: {
    functionName: 'lambda_worker_max_workers',
  },
  lambdaProducerSuccess: {
    functionName: 'lambda_producer_success',
  },
  lambdaProducerFailure: {
    functionName: 'lambda_producer_failure',
  },
  lambdaProducerBatchSize: {
    functionName: 'lambda_producer_batch_size',
  },
  lambdaLastIndexedSuccess: {
    functionName: 'lambda_last_indexed_success',
  },
  lambdaLastIndexedFailure: {
    functionName: 'lambda_last_indexed_failure',
  },
  lambdaQuerySuccess: {
    functionName: 'lambda_query_success',
  },
  lambdaQueryFailure: {
    functionName: 'lambda_query_failure',
  },
  sqsMessageCount: {
    functionName: 'sqs_message_count',
  },
  sqsMessageReceiveCount: {
    functionName: 'sqs_message_receive_count',
  },
  sqsDlqMessageCount: {
    functionName: 'sqs_dlq_message_count',
  },
};

export default metrics;
