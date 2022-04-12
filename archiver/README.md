# EVM Archiver

## Getting Started

### .env

Set the block range e.g.

```
START_BLOCK=14001000
END_BLOCK=14001999
BATCH_SIZE=5 # if this is too big the endpoints we get data from fail
```

Set endpoint:

```
RPC_ENDPOINT=your_rpc_endpoint
```

Set mongo URI

```
MONGO_URI="mongodb://0.0.0.0:27017/ethereum-archive"
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

- Create a deployment process that handles the creation of multiple instances of the application. Good logging is essential to prevent errors being ignored, creating gaps in the data.

## Decisions

### Is it worth doing this with GETH?

GETH or an alternative would allow us to request the data a lot faster, but it would require a more complex infrastructure. We currently have a full node (we may need an archive node, but the full node would be good to gauge performance on newer blocks).

### Compare MongoDB vs Parquet

Parquet is more complex, but it could offer improved query speed & storage savings.

MongoDB is a lot simpler, and as we only read/write (no updates), it may be a good choice, depending on query performance.
