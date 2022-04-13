# evm-processor

An application to process and index EVM data

## Moonbeam archiver

Run `yarn` at root then `cd archiver`.

Set `.env`:
```
RPC_ENDPOINT="ws://1.2.3.4:9944" # use actual moonbeam node here!
MONGO_URI="mongodb://0.0.0.0:27017/moonbeam-archive"

# optional
BATCH_SIZE=20 # defaults to 1, 20 is recommended
START_BLOCK=1000000 # defaults to 0
END_BLOCK=2000000 # stream new blocks if omitted
```

Start mongo with `yarn mongo:up`. _This should be separated so we have 1 mongo that multipel archivers can fill up in parallel._

Run the archiver: `yarn start:prod`.

## Moonbeam Query Node

This uses `MONGO_URI` from the same env file as the archiver. The `PORT` env is optional, it defaults to `4050`. To run the query node just run `yarn query-node`.

## Moonbeam Token Contract Indexer

Enter the directory: `cd indexers/token-contracts`.

Set `.env`:
```
# if the archive is on another server put the domain here
ARCHIVE_GRAPH='http://localhost:4050/graphql'

# keep these consistent with docker
DB_NAME=token-contracts
DB_HOST=0.0.0.0
DB_PORT=8002

# use actual moonbeam node here!
RPC_ENDPOINT="ws://1.2.3.4:9944"
```

Build the Postgres database: `yarn db:build`.

Run the indexer: `yarn start:prod`.

## Moonbeam Token Contract Query Node

This uses database env from the same env file as the indexer. The `PORT` env is optional, it defaults to `4000`. To run the query node just run `yarn query-node`.

## TODO - Uniswap

- pair account to track aggregate volumes
- BLOCKED: get token data from archive not web3 when ready
