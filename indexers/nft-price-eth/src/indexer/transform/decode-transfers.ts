import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';
import ERC721 from '@openzeppelin/contracts/build/contracts/ERC721.json';
import { BigNumber, ethers } from 'ethers';
import { Types } from 'indexer-utils';
import { TRANSFER, TRANSFER_BATCH, TRANSFER_SINGLE } from '../constants';
import { AssociatedLogs, NftTransfer, TokenTransfer } from '../types';

export default function decodeTransfers(associatedLogs: AssociatedLogs) {
  try {
    return {
      tokens: associatedLogs.erc20.map(decodeErc20Log),
      nfts: [
        ...associatedLogs.erc721.map(decodeErc721Log),
        ...associatedLogs.erc1155Single.map(decodeErc1155SingleLog),
        ...associatedLogs.erc1155Batch.flatMap(decodeErc1155BatchLog),
      ],
    };
  } catch (e) {
    return null;
  }
}

export function decodeErc20Log(log: Types.Archive.Log): TokenTransfer {
  const decoded = new ethers.utils.Interface(ERC20.abi).decodeEventLog(
    TRANSFER.SIGNATURE,
    log.data,
    [TRANSFER.ID, log.topic1!, log.topic2!],
  );
  return {
    contract: log.address,
    from: decoded[0].toLowerCase(),
    to: decoded[1].toLowerCase(),
    amount: decoded[2].toString(),
  };
}

export function decodeErc721Log(log: Types.Archive.Log): NftTransfer {
  const decoded = new ethers.utils.Interface(ERC721.abi).decodeEventLog(
    TRANSFER.SIGNATURE,
    log.data,
    [TRANSFER.ID, log.topic1!, log.topic2!, log.topic3!],
  );
  return {
    _id: log._id,
    blockNumber: log.blockNumber,
    blockTimestamp: log.blockTimestamp,
    transactionHash: log.transactionHash,
    transactionId: log.transactionId,
    contract: log.address,
    from: decoded[0].toLowerCase(),
    to: decoded[1].toLowerCase(),
    tokenId: decoded[2].toString(),
  };
}

export function decodeErc1155SingleLog(log: Types.Archive.Log): NftTransfer {
  const decoded = new ethers.utils.Interface(ERC1155.abi).decodeEventLog(
    TRANSFER_SINGLE.SIGNATURE,
    log.data,
    [TRANSFER_SINGLE.ID, log.topic1!, log.topic2!, log.topic3!],
  );
  return {
    _id: log._id,
    blockNumber: log.blockNumber,
    blockTimestamp: log.blockTimestamp,
    transactionHash: log.transactionHash,
    transactionId: log.transactionId,
    contract: log.address,
    from: decoded[1].toLowerCase(),
    to: decoded[2].toLowerCase(),
    tokenId: decoded[3].toString(),
    quantity: decoded[4].toString(),
  };
}

export function decodeErc1155BatchLog(log: Types.Archive.Log): NftTransfer[] {
  const decoded = new ethers.utils.Interface(ERC1155.abi).decodeEventLog(
    TRANSFER_BATCH.SIGNATURE,
    log.data,
    [TRANSFER_BATCH.ID, log.topic1!, log.topic2!, log.topic3!],
  );

  return (decoded[3] as BigNumber[]).map((tokenId, i) => {
    return {
      _id: `${log._id}.${i}`,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      transactionHash: log.transactionHash,
      transactionId: log.transactionId,
      contract: log.address,
      from: decoded[1].toLowerCase(),
      to: decoded[2].toLowerCase(),
      tokenId: tokenId.toString(),
      quantity: (decoded[4][i] as BigNumber).toString(),
    };
  });
}
