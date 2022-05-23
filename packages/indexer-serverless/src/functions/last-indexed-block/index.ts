import { AWS } from '@serverless/typescript';
import { handlerPath } from '../../libs/handler-resolver';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
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
