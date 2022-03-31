import { writeFileSync, readFileSync, existsSync } from 'fs';
import { queryChainHeight, queryTransactionsAndLogs } from './archive-queries';
import { ProcessorConfig, ContractSpec } from './types';
import { getMethodIdFromSignature } from './utils';

export async function processor(config: ProcessorConfig) {
  const startBlock = getStartBlock(config.startBlock);
  const { batchSize, endBlock, contracts: _contracts } = config;
  const contracts = contractsWithMethodIds(_contracts);
  const initialChainHeight = await queryChainHeight();
  const combinations = getCombinations(config.contracts);

  let currentBlock = startBlock;

  // todo - don't go past end block
  while (currentBlock < initialChainHeight) {
    let batchEndBlock = currentBlock + batchSize;
    if (batchEndBlock > initialChainHeight) {
      batchEndBlock = initialChainHeight;
    }

    const allTxs = await Promise.all(
      combinations.map(({ contract, methodId }) =>
        queryTransactionsAndLogs({
          startBlock: currentBlock,
          endBlock: batchEndBlock,
          methodId,
          contract,
        })
      )
    );

    const txs = allTxs.flat();
    txs.sort((a, b) => {
      if (b.block_number < a.block_number) return 1;
      if (a.block_number < b.block_number) return -1;
      if (b.transaction_index < a.transaction_index) return 1;
      if (a.transaction_index < b.transaction_index) return -1;
      return 0;
    });

    for (let i = 0; i < txs.length; i++) {
      await contracts[txs[i].to_address][txs[i].input.substring(2, 10)](txs[i]);

      console.log(
        `Processed block ${txs[i].block_number}: Transaction ${txs[i].transaction_index}`
      );
    }

    writeFileSync('last-indexed-block', batchEndBlock.toString());
    currentBlock = batchEndBlock;
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
  const lastIndexedBlock = getLastIndexedBlock();
  return lastIndexedBlock > startBlock ? lastIndexedBlock : startBlock;
}

function getLastIndexedBlock() {
  if (existsSync('last-indexed-block')) {
    const file = readFileSync('last-indexed-block');
    return parseInt(file.toString());
  }
  return 0;
}
