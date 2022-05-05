type StageConfigParameter = {
    envVar?: string | number,
    local?: string | number,
    dev?: string | number,
    prod?: string | number,
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
                default: 10
            },
            true
        ) as number,

        getProducerStartBlock: () => getParameterForStage(
            stage,
            {
                envVar: process.env['END_BLOCK'] ? Number(process.env['END_BLOCK']) : undefined,
                local: 14000000,
                default: undefined
            },
            false
        ) as number | undefined,

        getProducerEndBlock: () => getParameterForStage(
            stage,
            {
                envVar: process.env['END_BLOCK'] ? Number(process.env['END_BLOCK']) : undefined,
                local: 14000004,
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
    }
}