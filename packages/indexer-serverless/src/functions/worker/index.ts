import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';

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
      RPC_ENDPOINT: config.rpcEndpoint,
      ARCHIVE_GRAPH: config.archiveGraph,
      TOKEN_ACTIVITY_GRAPH: config.tokenActivityGraph,
      CONTRACT_GRAPH: config.contractGraph,
      MONGO_URI: stageConfig.getMongoURI(),
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
    },
    timeout: 60,
  } as keyof AWS['functions'];
}
