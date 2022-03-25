# evm-processor

An application to process and index EVM data

## TODO - Uniswap

- add swap method to schema
- rest of the swap methods for v3
- v2 swaps - migrate from The Graph
- get token decimals/symbol/name using contract (see identity-subgraph)

## TODO - Processor

- status schema (track curent block)
- loop blocks in batches (maintaining block order)
- query transactions (allow for customo and clause - e.g. like we need for multicall detection) and hydrate logs
- query events (need to ensure the data is properly understood here - where exacly are we looking for the method ID?)
-
