import { Params } from '../types';

type StageConfigParameter = {
  envVar?: string | number;
  local?: string | number;
  dev?: string | number;
  production?: string | number;
  default?: string | number;
};

const getParameterForStage = (
  stage: string,
  configParameter: StageConfigParameter,
  required = false,
) => {
  if (configParameter.envVar) {
    return configParameter.envVar;
  }
  if (configParameter[stage as keyof StageConfigParameter]) {
    return configParameter[stage as keyof StageConfigParameter];
  }
  if (configParameter.default) {
    return configParameter.default;
  }

  if (required) {
    // The stack trace will show which parameter
    throw new Error(
      `Required parameter missing: ${JSON.stringify(configParameter)}`,
    );
  }
};

export default (stage: string, params: Params) => {
  return {
    getMongoURI: () =>
      getParameterForStage(
        stage,
        {
          envVar: process.env['MONGO_URI'],
          local: 'mongodb://mongodb:27017/db',
          production: `mongodb://${params.mongoDnsName}:27017/db`,
        },
        true,
      ) as string,

    getWorkerConcurrency: () =>
      getParameterForStage(
        stage,
        {
          envVar: process.env['WORKER_CONCURRENCY']
            ? Number(process.env['WORKER_CONCURRENCY'])
            : undefined,
          local: 1,
          default: 1,
        },
        true,
      ) as number,

    getProducerEndBlock: () =>
      getParameterForStage(
        stage,
        {
          envVar: process.env['END_BLOCK']
            ? Number(process.env['END_BLOCK'])
            : undefined,
          local: 1000,
          default: undefined,
        },
        false,
      ) as number | undefined,

    getProducerBatchSize: () =>
      getParameterForStage(
        stage,
        {
          envVar: process.env['BATCH_SIZE']
            ? Number(process.env['BATCH_SIZE'])
            : undefined,
          local: 1,
          default: 20,
        },
        false,
      ) as number | undefined,
    getJobQueueName: () =>
      getParameterForStage(stage, {
        envVar: process.env['JOB_QUEUE_NAME'],
        default: `${stage}-producer-bucket`,
        production: params.jobQueueName,
      }),
    getPushGatewayURL: () =>
      getParameterForStage(stage, {
        envVar: process.env['PUSHGATEWAY_URL'],
        production: 'http://prometheus-push.litentry:9091',
        default: 'http://host.docker.internal:9091',
      }),
  };
};
