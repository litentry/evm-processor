import { utils, query, Types } from 'indexer-utils';
import { SwapMethod } from './types';

const V2_SIGS = utils.contract.CONTRACT_SIGNATURES.UNISWAPV2.EXTRINSICS;
const V3_SIG = utils.contract.CONTRACT_SIGNATURES.UNISWAPV3.EXTRINSICS[0]; // multicall (the rest are internal) -> todo check contracts indexed to see if we get a match on this (as internal methods might not be in op-codes)

export default async function extractTransactions(
  startBlock: number,
  endBlock: number,
) {
  const [v2, v3] = await Promise.all([
    fetchV2Txs(startBlock, endBlock),
    fetchV3Txs(startBlock, endBlock),
  ]);

  return {
    v2,
    v3,
  };
}

async function fetchV2Txs(startBlock: number, endBlock: number) {
  const v2 = await Promise.all(
    V2_SIGS.map(async (sig) => {
      const txs = await query.archive.contractTransactionsWithLogs({
        startBlock,
        endBlock,
        methodId: sig.ID,
      });

      const filtered = await filterByContractType('v2', txs);

      return {
        method: sig.SIGNATURE.split('(')[0] as SwapMethod,
        txs: filtered,
      };
    }),
  );

  return v2;
}

async function fetchV3Txs(startBlock: number, endBlock: number) {
  const txs = await query.archive.contractTransactionsWithLogs({
    startBlock,
    endBlock,
    methodId: V3_SIG.ID,
  });
  const filtered = await filterByContractType('v3', txs);

  return filtered;
}

async function filterByContractType(
  type: 'v2' | 'v3',
  txs: Types.Archive.ContractTransactionWithLogs[],
): Promise<Types.Archive.ContractTransactionWithLogs[]> {
  const method = type === 'v2' ? 'uniswapV2Contracts' : 'uniswapV3Contracts';

  const validContracts = await query.contracts[method]({
    contractAddress: txs.map((tx) => tx.to),
    properties: ['address'],
  });

  const validAddresses = validContracts.map((c) => c.address);

  return txs.filter((tx) => validAddresses.includes(tx.to));
}
