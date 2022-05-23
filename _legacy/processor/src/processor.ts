import { writeFileSync, readFileSync, existsSync } from 'fs';
import { query } from 'indexer-utils';
import { ProcessorConfig, ContractSpec } from './types';
import { getMethodIdFromSignature } from './utils';

export async function processor(config: ProcessorConfig) {
  const startBlock = getStartBlock(config.startBlock);
  const { batchSize, endBlock, contracts: _contracts } = config;
  const contracts = contractsWithMethodIds(_contracts);
  const initialChainHeight = await query.latestBlock();
  const combinations = getCombinations(config.contracts);

  let currentBlock = startBlock;

  // todo - don't go past end block
  while (currentBlock <= initialChainHeight) {
    let batchEndBlock = currentBlock + batchSize - 1;
    if (batchEndBlock > initialChainHeight) {
      batchEndBlock = initialChainHeight;
    }

    const allTxs = await Promise.allSettled(
      combinations.map(({ contract, methodId }) =>
        query.contractTransactionsWithLogs({
          startBlock: currentBlock,
          endBlock: batchEndBlock,
          contractAddress: contract,
          methodId,
        })
      )
    );

    const txs = allTxs.flat();

    for (let i = 0; i < txs.length; i++) {
      await contracts[txs[i].to][txs[i].methodId](txs[i]);

      console.log(
        `Processed block ${txs[i].blockNumber}: Transaction ${txs[i].transactionIndex}`
      );
    }

    writeFileSync('last-indexed-block', batchEndBlock.toString());
    currentBlock = batchEndBlock + 1;
  }

  // todo -> carry on block by block
}

function contractsWithMethodIds(contracts: ContractSpec): ContractSpec {
  const formatted: ContractSpec = {};

  Object.entries(contracts).forEach(([address, methods]) => {
    formatted[address] = {};
    Object.entries(methods).forEach(([sig, fn]) => {
      formatted[address][getMethodIdFromSignature(sig)] = fn;
    }, {});
  });

  return formatted;
}

function getCombinations(contracts: ContractSpec) {
  const combinations: {
    contract: string;
    methodId: string;
  }[] = [];

  Object.entries(contracts).forEach(([address, methods]) => {
    combinations.push(
      ...Object.keys(methods).map((method) => ({
        contract: address,
        methodId: getMethodIdFromSignature(method),
      }))
    );
  });

  return combinations;
}

function getStartBlock(startBlock: number) {
  if (existsSync('last-indexed-block')) {
    const file = readFileSync('last-indexed-block');
    return parseInt(file.toString()) + 1;
  }

  return startBlock;
}
