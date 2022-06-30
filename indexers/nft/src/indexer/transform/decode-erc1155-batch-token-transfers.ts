import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import { Types } from 'indexer-utils';

export default function decodeErc1155BatchTokenTransfers(
  logs: Types.Archive.Log[],
  contracts: Types.Contract.ERC1155Contract[],
): Types.Nft.ERC1155TokenTransfer[] {
  return logs
    .map((log) => {
      const decoded = new ethers.utils.Interface(ERC1155.abi).decodeEventLog(
        'TransferBatch(address,address,address,uint256[],uint256[])',
        log.data,
        [log.topic0, log.topic1!, log.topic2!, log.topic3!, log.topic4!],
      );

      const shared = {
        _id: log._id,
        contract: log.address,
        from: (decoded[1] as string).toLowerCase(),
        to: (decoded[2] as string).toLowerCase(),
        transactionHash: log.transactionHash,
        transactionId: log.transactionId,
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        collectionName: contracts.find(
          (contract) => contract._id === log.address,
        )?.name,
      };

      return (decoded[3] as BigNumber[]).map((tokenId, i) => {
        const transfer: Types.Nft.ERC1155TokenTransfer = {
          tokenId: tokenId.toString(),
          quantity: (decoded[4][i] as BigNumber).toNumber(),
          ...shared,
        };
        return transfer;
      });
    })
    .flat();
}
