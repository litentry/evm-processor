import {S3} from "aws-sdk";

const lastQueuedEndBlockObjectName = 'last-queued-end-block.txt';
const bucketName = process.env.BUCKET_NAME;

const params = {
    Bucket: bucketName,
    Key: lastQueuedEndBlockObjectName
}

// @Todo find a better solution
const s3 = new S3(process.env.LOCALSTACK_HOSTNAME ? { endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`, s3ForcePathStyle: true } : {});

export const getLastQueuedEndBlock = () => s3.getObject(params).promise().then(
    object => Number(object.Body.toString()),
    err => {
        if (err.code === 'NoSuchKey') {
            return null;
        }
        throw err;
    }
);

export const saveLastQueuedEndBlock = (lastQueuedEndBlock: number) => s3.putObject({
    ...params, Body: `${lastQueuedEndBlock}`
}).promise();