import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Types } from 'indexer-utils';
import { TRANSFER_1155_BATCH } from '../constants';

type Decoded = [string, string, string, BigNumber[], BigNumber[]];

export default function decodeErc1155BatchTokenTransfers(
  logs: Types.Archive.Log[],
  contracts: Types.Contract.ERC1155Contract[],
): Types.Nft.ERC1155TokenTransfer[] {
  return logs.reduce((prev, log) => {
    let decoded: Decoded;

    try {
      decoded = new ethers.utils.Interface(ERC1155.abi).decodeEventLog(
        'TransferBatch(address,address,address,uint256[],uint256[])',
        log.data,
        [TRANSFER_1155_BATCH, log.topic1!, log.topic2!, log.topic3!],
      ) as Decoded;
    } catch (e) {
      console.error(
        `Non compliant log on tx: ${log.transactionHash} at index ${log.logIndex}`,
      );
      /*
      Some transactions emit dodgy logs e.g. https://etherscan.io/tx/0x043f5291b40c6b8c47f6e5578942ac60bed0284b10de7baf9394317b0b70ec1f
      */
      return prev;
    }

    const shared = {
      contract: log.address,
      from: (decoded[1] as string).toLowerCase(),
      to: (decoded[2] as string).toLowerCase(),
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      collectionName: contracts.find((contract) => contract._id === log.address)
        ?.name,
    };

    const transfers = (decoded[3] as BigNumber[]).map((tokenId, i) => {
      const transfer: Types.Nft.ERC1155TokenTransfer = {
        _id: `${log._id}.${i}`,
        tokenId: tokenId.toString(),
        quantity: (decoded[4][i] as BigNumber).toString(),
        ...shared,
      };
      return transfer;
    });

    return [...prev, ...transfers];
  }, [] as Types.Nft.ERC1155TokenTransfer[]);
}
