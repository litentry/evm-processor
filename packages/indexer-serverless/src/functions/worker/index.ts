import { AWS } from '@serverless/typescript';
import { handlerPath } from '../../libs/handler-resolver';
import stageConfigFactory from '../../config/stage-config';
import { getContext } from '../../util/context';
import { Config } from '../../types';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default (config: Config) =>
  ({
    handler: './lib/lambda/worker.default',
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
      MONGO_URI: stageConfig.getMongoURI(),
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
    },
    timeout: 60,
  } as keyof AWS['functions']);
