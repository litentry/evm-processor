# EVM Processor

This is a collection of applications to process and index data from blockchains running on the Ethereum Virtual Machine.

The applications that index data live in the `/indexers` directory, and the shared logic lives in an npm package in the `/packages/indexer-utils`. This package is unpublished and yarn workspaces is used to enable the indexers to use it as a dependency.

## Contents of `indexer-utils`:

There are various utilities in here, the main tools are listed below.

### Processor

The processor method handles looping through batches of blocks as well optional streaming of new blocks.

```typescript
async function processor(
  start: number,
  end: number | (() => Promise<number>),
  batchSize: number,
  batchHandler: (start: number, end: number) => Promise<void>
)
```

If you want to index a fixed block range then stop, pass a number to `end`, if you want to stream live data, pass a method to fetch the latest block from the data source you depend on. This could be an RPC node (as in `indexers/archive`), or another indexer (as in `indexers/token-contracts` which depends on the archive indexer).

The `start` and `end` parameters the processor passes to you handler are the start and end blocks of the batches, e.g. if you run `processor(0, 20, 10, batchHandler)`, your handler will be called like this:

- `await batchHandler(0, 9)`
- `await batchHandler(10, 19)`
- `await batchHandler(19, 20)`

### Query

The indexers often depend on each other (the archive is almost always depended on), and GraphQL is used to expose the data in the indexers. Writing GraphQL queries in node applications can be a little unpleasant, so we maintain the `query` object, which makes pulling data from the graph more convenient. `properties` is always optional, by default all fields are returned. If you want to reduce the data transferred over the network you can select just the fields you want.

```typescript
const txs = await query.archive.contractTransactions({
  startBlock,
  endBlock,
  methodId,
  properties: [
    'hash',
    'to',
    'from',
    'value',
    'receiptStatus',
  ],
});
```

### Types

The various types shared by the indexers. These are built into an object to make them a little easier to organise and find.

```typescript
import { Types } from 'indexer-utils'

const block: Types.Archive.Block = {
  ...
}
```

### GraphQL Server

This is a small helper method to allow indexers to run an `express-graphql` server in as little code as possible.

```typescript
import { graphqlServer } from 'indexer-utils';

graphqlServer(schema, port);
```

## Building an Indexer

Using `indexers/token-contracts` as an example:

### `src/index.ts`

```typescript
import 'dotenv/config';
import mongoose from 'mongoose';
import schema from './schema'; // database & graphql
import { graphqlServer, processor } from 'indexer-utils';
import handler from './handler';
import { batchSize, end, mongoUri, port, start } from './config';

async function run() {
  // connect to the database
  await mongoose.connect(mongoUri);

  // run the processor, handler is where the business logic goes
  processor(start, end, batchSize, handler);

  // if streaming, setup a graphql server
  if (typeof end !== 'number') {
    graphqlServer(schema, port);
  }
}

run();
```

### `src/schema.ts`

This is simplified to focus on a single model:

```typescript
import mongoose from 'mongoose';
import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';

/*
This is a minor typescript inconvenience.
If we don't extend the document before passing the interface to
mongoose.Schema then composeMongoose complains. We don't do the
Document extention in archive-utils as the interface is usually
used as a plain JS object.
*/
interface ERC20Document
  extends Types.Contract.ERC20Contract,
    mongoose.Document {}

// Define the MongoDB schema (with indexes)
const ERC20ContractSchema = new mongoose.Schema<ERC20Document>({
  address: { type: String, required: true, index: true },
  creator: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  erc165: { type: Boolean, required: true, index: true },
  timestamp: { type: Number, required: true },
  symbol: String,
  name: String,
  decimals: Number,
});

/*
Create an export the model, which can be used like this:
ERC20ContractModel.create({...})
*/
export const ERC20ContractModel = mongoose.model(
  'ERC20Contract',
  ERC20ContractSchema
);

/*
Create the type composer and define the graphql schema
(https://graphql-compose.github.io/docs/basics/understanding-relations.html)
*/
const ERC20ContractTC = composeMongoose(ERC20ContractModel);

schemaComposer.Query.addFields({
  /*
  we generally want the same filter restrictions everywhere,
  so this is stored in archive-utils
  */
  erc20Contracts: ERC20ContractTC.mongooseResolvers.findMany(filter),
});

// export the schema which we pass to graphqlServer(schema, port)
export default schemaComposer.buildSchema();
```

### `src/handler.ts`

```typescript
import { query } from 'indexer-utils';
import handleContractCreation from './handle-contract-creation';
import { BlockModel } from './schema';

export default async function handler(startBlock: number, endBlock: number) {
  // fetch the data from the archive graph
  const txs = await query.archive.contractCreationTransactions({
    startBlock,
    endBlock,
    properties: [
      'receiptContractAddress',
      'from',
      'blockNumber',
      'blockTimestamp',
      'input',
      'receiptStatus',
    ],
  });

  // do something with it
  await Promise.all(txs.map(handleContractCreation));

  /*
  This allows us to store the latest indexed block,
  so the token-activity indexer (that relies on this one)
  can track the latest block to stream new data
  */
  await BlockModel.create({ number: endBlock });
}
```

## Deployment

We are currently using docker, this is hosted on AWS EC2 as a short term proof of concept. Eventually we will be running indexers in parallel instances to reduce the time it takes to index historical data.
