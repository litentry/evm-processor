# Importer

This is just a temporary helper to spin up a local postgres database with the ethereum-etl schema

## Getting Started

One time only: `pip3 install 'ethereum-etl[streaming]'`

Bring database up: `docker-compose up -d`

Import data, from start block continuously:

```
ethereumetl stream --provider-uri https://mainnet.infura.io/v3/{YOUR_INFURA_KEY_HERE} --start-block {START_BLOCK_HERE} --output=postgresql+pg8000://postgres:postgres@0.0.0.0:8000/ethereum
```

Bring database down (wipes data): `docker-compose down`
