import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default {
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
  },
};
