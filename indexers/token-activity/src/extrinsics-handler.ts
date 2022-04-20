import { query, Types } from 'indexer-utils';
import { decodeParams } from './decode';
import {
  ERC1155TransactionDecodedModel,
  ERC20TransactionDecodedModel,
  ERC721TransactionDecodedModel,
} from './schema';

export default async function extrinsicsHandler(
  startBlock: number,
  endBlock: number,
  type: 20 | 721 | 1155,
  extrinsics: Types.Contract.ContractSignatureItem[],
  model:
    | typeof ERC20TransactionDecodedModel
    | typeof ERC721TransactionDecodedModel
    | typeof ERC1155TransactionDecodedModel
) {
  // get the extrinsics
  const txs = await Promise.all(
    extrinsics.map(async (extrinsic) => {
      const txs = await query.archive.contractTransactions({
        startBlock,
        endBlock,
        methodId: extrinsic.ID,
        properties: [
          'hash',
          'blockNumber',
          'blockTimestamp',
          'to',
          'from',
          'methodId',
          'value',
          'input',
          'receiptStatus',
        ],
      });
      const _txs = await query.archive.contractTransactions({
        startBlock,
        endBlock,
        methodId: extrinsic._ID,
        properties: [
          'hash',
          'blockNumber',
          'blockTimestamp',
          'to',
          'from',
          'methodId',
          'value',
          'input',
          'receiptStatus',
        ],
      });
      return [...txs, ..._txs];
    })
  );
  // filter non-erc standard txs
  const uniqueContractAddresses = [...new Set(txs.flat().map((tx) => tx.to))];
  const ercContracts = await query.tokenContracts[`erc${type}Contracts`]({
    contractAddress: uniqueContractAddresses,
    properties: ['address'],
  });
  const ercContractAddresses = ercContracts.map((c) => c.address);
  const ercTxs = txs
    .flat()
    .filter((tx) => ercContractAddresses.includes(tx.to));

  await model.insertMany(
    ercTxs.map((tx) => {
      const ex = extrinsics.find((ex) => ex.ID === tx.methodId)!;
      const transaction: Types.Contract.DecodedContractTransaction = {
        hash: tx.hash,
        contract: tx.to,
        signer: tx.from,
        signature: ex.SIGNATURE,
        blockNumber: tx.blockNumber,
        blockTimestamp: tx.blockTimestamp,
        ...decodeParams(ex.PARAMS, tx.input),
      };
      return transaction;
    })
  );
}
