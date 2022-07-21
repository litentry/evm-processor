import ERC721 from '@openzeppelin/contracts/build/contracts/ERC721.json';
import { BigNumber, ethers } from 'ethers';
import { Types } from 'indexer-utils';
import { TRANSFER_721 } from '../constants';

type Decoded = [string, string, BigNumber];

export default function decodeErc721TokenTransfers(
  logs: Types.Archive.Log[],
  contracts: Types.Contract.ERC721Contract[],
): Types.Nft.ERC721TokenTransfer[] {
  return logs.reduce((prev, log) => {
    let decoded: Decoded;

    try {
      decoded = new ethers.utils.Interface(ERC721.abi).decodeEventLog(
        'Transfer(address,address,uint256)',
        log.data,
        [TRANSFER_721, log.topic1!, log.topic2!, log.topic3!],
      ) as Decoded;
    } catch (e) {
      console.error(
        `Non compliant log on tx: ${log.transactionHash} at index ${log.logIndex}`,
      );
      return prev;
    }

    const transfer: Types.Nft.ERC721TokenTransfer = {
      _id: log._id,
      contract: log.address,
      from: (decoded[0] as string).toLowerCase(),
      to: (decoded[1] as string).toLowerCase(),
      tokenId: (decoded[2] as BigNumber).toString(),
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      collectionName: contracts.find((contract) => contract._id === log.address)
        ?.name,
    };
    return [...prev, transfer];
  }, [] as Types.Nft.ERC721TokenTransfer[]);
}
