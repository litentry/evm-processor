import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';
import getEnvVar from '../../util/get-env-var';

const context = getContext();

export default function (config: Config, params: Params) {
  const stageConfig = stageConfigFactory(context.options.stage, params);
  return {
    handler: './src/lambda/last-indexed-block.default',
    reservedConcurrency: 1,
    events: [
      {
        schedule: 'rate(1 minute)',
      },
    ],
    environment: {
      MONGO_URI: stageConfig.getMongoURI(),
      CHAIN: config.chain,
      DEPLOY_VERSION: config.version,
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
      SERVICE_NAME: config.serviceName,
      SHARDING_ENABLED: <string>getEnvVar('SHARDING_ENABLED', true)
    },
    timeout: 30,
  } as keyof AWS['functions'];
}
