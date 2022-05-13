import { Params } from "../../serverless";

type StageConfigParameter = {
    envVar?: string | number,
    local?: string | number,
    dev?: string | number,
    production?: string | number,
    default?: string | number,
}

const getParameterForStage = (
    stage: string,
    configParameter: StageConfigParameter,
    required = false
) => {

    for (const k of ['envVar', stage, 'default']) {
        if (configParameter[k] !== undefined) {
            return configParameter[k];
        }
    }

    if (required) {
        //The stack trace will show which parameter
        throw new Error(`Required parameter missing`);
    }
}

export default (stage: string) => {
    return {

        getMongoURI: () => getParameterForStage(
            stage,
            {
                envVar: process.env['MONGO_URI'],
                local: 'mongodb://mongodb:27017/evm-archive',
            },
            true
        ) as string,

        getWorkerConcurrency: () => getParameterForStage(
            stage,
            {
                envVar: process.env['WORKER_CONCURRENCY'] ? Number(process.env['WORKER_CONCURRENCY']) : undefined,
                local: 1,
                default: 1
            },
            true
        ) as number,

        getProducerStartBlock: () => getParameterForStage(
            stage,
            {
                envVar: process.env['START_BLOCK'] ? Number(process.env['START_BLOCK']) : 0,
                local: 14000000,
                default: 0
            },
            false
        ) as number | undefined,

        getProducerEndBlock: () => getParameterForStage(
            stage,
            {
                envVar: process.env['END_BLOCK'] ? Number(process.env['END_BLOCK']) : undefined,
                local: 14000100,
                default: undefined
            },
            false
        ) as number | undefined,

        getProducerBatchSize: () => getParameterForStage(
            stage,
            {
                envVar: process.env['BATCH_SIZE'] ? Number(process.env['BATCH_SIZE']) : undefined,
                local: 1,
                default: 20

            },
            false
        ) as number | undefined,

        getProducerBucketName: () => getParameterForStage(
            stage,
            {
                envVar: process.env['PRODUCER_BUCKET_NAME'],
                default: `${stage}-producer-bucket`
            }
        ),
        getPushGatewayURL: () => getParameterForStage(
            stage,
            {
                envVar: process.env['PUSHGATEWAY_URL'],
                production: 'http://prometheus-push.litentry:9091',
                default: 'http://host.docker.internal:9091',
            }
        ),
    }
}
