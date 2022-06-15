import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';

const context = getContext();

export default function (config: Config, params: Params) {
  const stageConfig = stageConfigFactory(context.options.stage, params);
  return {
    handler: './src/lambda/query.default',
    events: [
      {
        http: {
          path: 'graphql',
          method: 'get',
          cors: true,
        },
      },
      {
        http: {
          path: 'graphql',
          method: 'post',
          cors: true,
        },
      },
    ],
    environment: {
      MONGO_URI: stageConfig.getMongoURI(),
      CHAIN: config.chain,
      DEPLOY_VERSION: config.version,
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL()?.toString() || '',
      SERVICE_NAME: config.serviceName,
    },
  };
}
