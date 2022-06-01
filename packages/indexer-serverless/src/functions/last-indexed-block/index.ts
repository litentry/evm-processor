import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';

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
    },
    timeout: 30,
  } as keyof AWS['functions'];
}
