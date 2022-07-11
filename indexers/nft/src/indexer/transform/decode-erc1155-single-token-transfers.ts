import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Types } from 'indexer-utils';

type Decoded = [string, string, string, BigNumber, BigNumber];

export default function decodeErc1155SingleTokenTransfers(
  logs: Types.Archive.Log[],
  contracts: Types.Contract.ERC1155Contract[],
): Types.Nft.ERC1155TokenTransfer[] {
  return logs.reduce((prev, log) => {
    let decoded: Decoded;

    try {
      decoded = new ethers.utils.Interface(ERC1155.abi).decodeEventLog(
        'TransferSingle(address,address,address,uint256,uint256)',
        log.data,
        [log.topic0, log.topic1!, log.topic2!, log.topic3!],
      ) as Decoded;
    } catch (e) {
      console.error(
        `Non compliant log on tx: ${log.transactionHash} at index ${log.logIndex}`,
      );
      return prev;
    }

    const transfer: Types.Nft.ERC1155TokenTransfer = {
      _id: log._id,
      contract: log.address,
      from: (decoded[1] as string).toLowerCase(),
      to: (decoded[2] as string).toLowerCase(),
      tokenId: (decoded[3] as BigNumber).toString(),
      quantity: (decoded[4] as BigNumber).toString(),
      transactionHash: log.transactionHash,
      transactionId: log.transactionId,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      collectionName: contracts.find((contract) => contract._id === log.address)
        ?.name,
    };
    return [...prev, transfer];
  }, [] as Types.Nft.ERC1155TokenTransfer[]);
}
