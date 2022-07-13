import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';
import getEnvVar from '../../util/get-env-var';

const context = getContext();

export default function (config: Config, params: Params) {
  const stageConfig = stageConfigFactory(context.options.stage, params);
  return {
    handler: './src/lambda/worker.default',
    reservedConcurrency:
      config.maxWorkers || stageConfig.getWorkerConcurrency(),
    events: [
      {
        sqs: {
          batchSize: 1,
          arn: {
            'Fn::GetAtt': ['JobQueue', 'Arn'],
          },
          functionResponseType: 'ReportBatchItemFailures',
        },
      },
    ],
    environment: {
      QUEUE_URL: { Ref: 'JobQueue' },
      QUEUE_DLQ_URL: { Ref: 'JobQueueDLQ' },
      RPC_ENDPOINT: config.rpcEndpoint,
      ARCHIVE_GRAPH: config.archiveGraph,
      ERC20_GRAPH: config.erc20Graph,
      CONTRACT_GRAPH: config.contractGraph,
      NFT_GRAPH: config.nftGraph,
      MONGO_URI: stageConfig.getMongoURI(),
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
      CHAIN: config.chain,
      DEPLOY_VERSION: config.version,
      SERVICE_NAME: config.serviceName,
      EXTRACTION_SOURCE: config.extractionSource,
      SHARDING_ENABLED: <string>getEnvVar('SHARDING_ENABLED', true),
    },
    timeout: 60,
    memorySize: 2048,
  } as keyof AWS['functions'];
}
