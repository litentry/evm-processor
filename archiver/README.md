# EVM Archiver

## Getting Started

### .env

Set the block range e.g.

```
START_BLOCK=14001000
END_BLOCK=14001999
BATCH_SIZE=5 # if this is too big the endpoints we get data from fail
```

If you want to use a standard RPC endpoint set:

```
EXTRACT_TYPE=rpc
```

If you want to use BlockVision to enable querying all transaction receipt for a block in 1 request (rather than per transaction) set:

```
EXTRACT_TYPE=bv
```

Set endpoint:

```
EXTRACT_ENDPOINT=your_rpc_or_blockvision_endpoint
```

If you want to use mongodb for archive storage set:

```
LOAD_TYPE=mongo
MONGO_URI="mongodb://0.0.0.0:27017/ethereum-archive"
```

If you want to use parquet for archive storage set:

```
LOAD_TYPE=parquet
CONNECTION_CONFIG_TODO
```

### Run the Application

Install dependencies with `yarn`.

If you are using mongodb run `yarn mongo:up`.

- To stop the mongo container without deleting the data run `yarn mongo:stop`.

- If you want to take the mongo container down and delete the data run `yarn mongo:down`.

If you are using parquet: **TODO**

Run the archiver with: `yarn start`

## How it Works

This is a simple Extract, Transform and Load application. It loops through the given block range, pulling the data from the source specified in config, transforms it to models we want to save, and loads it into the database specified in config.

The plan is to run multiple instances of these in parallel to speed up the rebuilding of history.

### TODO

- Add streaming mode to update when new blocks are published.

- Sometimes data request fail and need to be re-run, we need to ensure this restarts from the last block indexed in the range + 1 and keeps restarting when required until the range is complete.

- Create a deployment process that handles the creation of multiple instances of the application. Good logging is essential to prevent errors being ignored, creating gaps in the data.

## Decisions

### Is it worth doing this with GETH?

GETH or an alternative would allow us to request the data a lot faster, but it would require a more complex infrastructure. We currently have a full node (we may need an archive node, but the full node would be good to gauge performance on newer blocks).

### Compare MongoDB vs Parquet

Parquet is more complex, but it could offer improved query speed & storage savings.

MongoDB is a lot simpler, and as we only read/write (no updates), it may be a good choice, depending on query performance.

### Consider Ignored Fields

The following fields have been ignored to save on data. Seeing as processing history is such a heavy task this might be a bad idea.

- gasPrice (better gas data in receipt)
- maxPriorityFeePerGas (better gas data in receipt)
- maxFeePerGas (better gas data in receipt)
- gasLimit (better gas data in receipt)
- r
- s
- v
- chainId
- confirmations (blocks since it was mined, incorrect a few seconds after fetching!)

### Consider storing failed transactions

We are only storing sucessful transactions (I assume this is over 90% of the total). The saving is small, and the main bulk of building history is requesting all the data (which we would need to do fully again). So whilst we can fetch these at a later date, it may be worth doing it from the start.
