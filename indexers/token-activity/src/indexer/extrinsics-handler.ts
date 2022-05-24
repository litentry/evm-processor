import { query, Types } from 'indexer-utils';
import { decodeParams, DecodedExtrinsic } from './decode';
import {
  ERC1155TransactionDecodedModel,
  ERC20TransactionDecodedModel,
  ERC721TransactionDecodedModel,
} from '../schema';

const CONFLICTING_SIGNATURES = [
  'approve(address,uint256)',
  'transferFrom(address,address,uint256)',
  'setApprovalForAll(address,bool)',
];

export default async function extrinsicsHandler(
  startBlock: number,
  endBlock: number,
  type: 20 | 721 | 1155,
  extrinsics: Types.Contract.ContractSignatureItem[],
  model:
    | typeof ERC20TransactionDecodedModel
    | typeof ERC721TransactionDecodedModel
    | typeof ERC1155TransactionDecodedModel,
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
    }),
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
    ercTxs
      .map((tx) => {
        const ex = extrinsics.find((ex) =>
          [ex.ID, ex._ID].includes(tx.methodId),
        )!;
        let decoded: DecodedExtrinsic;

        try {
          decoded = decodeParams(ex.PARAMS, tx.input);
        } catch (e) {
          // contracts can be more than 1 standard, when the same methods are found on both we know this will blow up for 1 of the contract types as the log data won't match up (e.g. unit256 on transfer is indexed in 721 but not 20)
          if (CONFLICTING_SIGNATURES.includes(ex.SIGNATURE)) {
            return null;
          }
          throw new Error(JSON.stringify(e));
        }
        const transaction: Types.Contract.DecodedContractTransaction = {
          hash: tx.hash,
          contract: tx.to,
          signer: tx.from,
          signature: ex.SIGNATURE,
          blockNumber: tx.blockNumber,
          blockTimestamp: tx.blockTimestamp,
          ...decoded,
        };
        return transaction;
      })
      .filter((tx) => tx),
  );
}
