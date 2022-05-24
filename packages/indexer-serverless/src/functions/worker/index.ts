import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { getContext } from '../../util/context';
import { Config } from '../../types';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default (config: Config) =>
  ({
    handler: './src/lambda/worker.default',
    reservedConcurrency: stageConfig.getWorkerConcurrency(),
    events: [
      {
        sqs: {
          batchSize: 10,
          arn: {
            'Fn::GetAtt': ['JobQueue', 'Arn'],
          },
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
  } as keyof AWS['functions']);
