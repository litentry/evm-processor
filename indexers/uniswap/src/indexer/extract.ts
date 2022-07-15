import { query, Types, utils } from 'indexer-utils';
import { ExtractedData, SwapMethod } from './types';

const V2_SIGS = utils.contract.CONTRACT_SIGNATURES.UNISWAPV2.EXTRINSICS;
const V3_SIG = utils.contract.CONTRACT_SIGNATURES.UNISWAPV3.EXTRINSICS[0]; // multicall (the rest are internal) -> todo check contracts indexed to see if we get a match on this (as internal methods might not be in op-codes)

export default async function extract(
  startBlock: number,
  endBlock: number,
): Promise<ExtractedData> {
  try {
    const [v2, v3] = await Promise.all([
      fetchV2Txs(startBlock, endBlock),
      fetchV3Txs(startBlock, endBlock),
    ]);

    return {
      v2,
      v3,
    };
  } catch (e) {
    const data: ExtractedData = { v2: [], v3: [] };

    let block = startBlock;
    while (block <= endBlock) {
      const [v2, v3] = await Promise.all([
        fetchV2Txs(block, block),
        fetchV3Txs(block, block),
      ]);
      data.v2.push(...v2);
      data.v3.push(...v3);

      block++;
    }

    return data;
  }
}

async function fetchV2Txs(startBlock: number, endBlock: number) {
  const v2 = await Promise.all(
    V2_SIGS.map(async (sig) => {
      const txs = await query.archive.contractTransactionsWithLogs({
        startBlock,
        endBlock,
        methodId: sig.ID,
        transactionProperties: [
          '_id',
          'from',
          'to',
          'input',
          'value',
          'receiptStatus',
          'gas',
          'blockNumber',
          'blockTimestamp',
        ],
        logProperties: ['address', 'topic0', 'data'],
      });

      const filtered = await filterByContractTypeAndStatus('v2', txs);

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
    transactionProperties: [
      '_id',
      'from',
      'to',
      'input',
      'value',
      'receiptStatus',
      'gas',
      'blockNumber',
      'blockTimestamp',
    ],
    logProperties: ['address', 'topic0', 'data'],
  });
  const filtered = await filterByContractTypeAndStatus('v3', txs);

  return filtered;
}

async function filterByContractTypeAndStatus(
  type: 'v2' | 'v3',
  txs: Types.Archive.ContractTransactionWithLogs[],
): Promise<Types.Archive.ContractTransactionWithLogs[]> {
  const method = type === 'v2' ? 'uniswapV2Contracts' : 'uniswapV3Contracts';

  const successfulTxs = txs.filter((tx) => tx.receiptStatus);
  const validContracts = await query.contracts[method]({
    contractAddress: successfulTxs.map((tx) => tx.to),
    properties: ['_id'],
  });

  const validAddresses = validContracts.map((c) => c._id);

  return successfulTxs.filter((tx) => validAddresses.includes(tx.to));
}
