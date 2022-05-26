import { AWS } from '@serverless/typescript';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';

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
    },
  } as keyof AWS['functions'];
}
