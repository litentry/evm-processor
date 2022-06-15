import type { AWS } from '@serverless/typescript';

export type Chain = 'ethereum' | 'moonbeam' | 'moonriver' | 'bsc';
export type ExtractionSource = 'nodereal' | 'ankr';

export type Params = {
  org: string;
  clusterStackName: string;
  mongoImageVersion: string;
  region: AWS['provider']['region'];
  mongoDnsName: string;
  ebsVolumeName: string;
  jobQueueName: string;
  maxWorkers: number;
  chain: Chain;
};

export type ProducerConfig = {
  batchSize: number;
  start: number;
  end: number | (() => Promise<number>);
  mongoUri: string;
};

export type Config = {
  serviceName: string;
  chain: Chain;
  version: string;
  latestBlockDependency:
    | 'archive-node'
    | 'archive-graph'
    | 'contract-graph'
    | 'token-activity-graph';
  rpcEndpoint?: string;
  archiveGraph?: string;
  contractGraph?: string;
  tokenActivityGraph?: string;
  maxWorkers: number;
  targetTotalQueuedBlocks?: number;
  extractionSource?: ExtractionSource;
};
