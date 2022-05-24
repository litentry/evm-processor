# EVM Processor

This is a collection of applications to process and index data from blockchains running on the Ethereum Virtual Machine.

The applications that index data live in the `/indexers` directory, and the shared logic lives in the `/packages` directory.

## Serverless

### Running locally

Run `yarn run start:local` in the folder of the indexer you wish to run.

Some useful commands for once it is running:

```
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes --queue-url http://host.docker.internal:4566/000000000000/JobQueue --attribute-names All
aws --endpoint-url=http://localhost:4566 logs tail /aws/lambda/${INDEXER_NAME}-local-worker
aws --endpoint-url=http://localhost:4566 logs tail /aws/lambda/${INDEXER_NAME}-local-producer
```
