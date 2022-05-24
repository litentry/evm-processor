import { AWS } from '@serverless/typescript';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default {
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
