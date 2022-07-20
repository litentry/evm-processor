import {
  ExtractedNFTPriceData,
  MismatchedTransfers,
  MissingContracts,
  NftTransfer,
  TokenTransfer,
  TransformedNFTPriceData,
} from '../types';
import { BigNumber, ethers } from 'ethers';
import {
  NFT_MARKETPLACE_AGGREGATORS,
  OPENSEA_WYVERN,
  X2Y2,
} from '../constants';
import decodeTransfers from './decode-transfers';
import { Types } from 'indexer-utils';
import * as util from 'util';

export function decodeX2Y2Sales(
  data: ExtractedNFTPriceData['x2y2'],
): TransformedNFTPriceData {
  const mismatchedTransfers: MismatchedTransfers[] = [];
  const missingContracts: MissingContracts[] = [];
  const sales: Types.Nft.Sale[] = [];

  data.logs.forEach((log) => {
    const decoded = new ethers.utils.Interface(X2Y2.ABI).decodeEventLog(
      X2Y2.SIGNATURE,
      log.data,
      [X2Y2.EVENT_HASH, log.topic1!],
    );
    const logParams = {
      itemHash: decoded.itemHash,
      maker: decoded.maker,
      taker: decoded.taker,
      orderSalt: decoded.orderSalt,
      settleSalt: decoded.settleSalt,
      intent: decoded.intent,
      delegateType: decoded.delegateType,
      deadline: decoded.deadline,
      currency: decoded.currency,
      dataMask: decoded.dataMask,
      item: decoded.item,
      detail: decoded.detail,
    } as {
      item: {
        price: BigNumber;
        data: string;
      };
      maker: string;
      taker: string;
    };

    const [, , tokenContractString, tokenIdString] = <string[]>(
      logParams.item.data.substring(2).match(/.{1,64}/g)
    );

    const tokenContract = `0x${tokenContractString}`;
    const tokenId = BigNumber.from(`0x${tokenIdString}`).toString();

    const has1155Single = !!log.associatedLogs.erc1155Single.length;
    const has1155Batch = !!log.associatedLogs.erc1155Batch.length;
    const has721 = !!log.associatedLogs.erc721.length;

    // should only hit this if an nft contract sets tokenId as unindexed
    if (!has1155Single && !has1155Batch && !has721) {
      missingContracts.push({
        _id: log.transactionHash,
      });
      return;
    }

    const transfers = decodeTransfers(log.associatedLogs);
    // dodgy logs if null, so ignore
    if (!transfers) return;

    const filteredTransfers = filterTransfers(
      transfers.nfts,
      logParams.maker,
      logParams.taker,
      tokenId,
    );

    if (!filteredTransfers.length) {
      mismatchedTransfers.push({
        _id: log.transactionHash,
      });
      return;
    }

    const pricePerNft = logParams.item.price.div(filteredTransfers.length);

    const erc20Data = getErc20Data(
      data.associatedContracts.erc20,
      transfers.tokens,
      filteredTransfers[0].from,
      filteredTransfers[0].to,
      logParams.item.price.toString(),
      logParams.taker,
    );

    if (erc20Data.erc20Contract && !erc20Data.erc20Name) {
      missingContracts.push({
        _id: erc20Data.erc20Contract,
      });
    }

    filteredTransfers.forEach((transfer) => {
      const collectionName = getCollectionName(
        data.associatedContracts.erc721,
        data.associatedContracts.erc1155,
        transfer,
      );
      if (!collectionName) {
        missingContracts.push({
          _id: transfer.contract,
        });
      }
      const sale: Types.Nft.Sale = {
        ...transfer,
        ...erc20Data,
        collectionName,
        price: pricePerNft.toString(),
      };
      sales.push(sale);
    });
  });

  return {
    mismatchedTransfers,
    sales,
    missingContracts,
  };
}

function getCollectionName(
  erc721Contracts: Types.Contract.ERC721Contract[],
  erc1155Contracts: Types.Contract.ERC1155Contract[],
  transfer: NftTransfer,
) {
  if (transfer.quantity) {
    const contract = erc1155Contracts.find(
      (contract) => contract._id === transfer.contract,
    );
    return contract?.name;
  }
  const contract = erc721Contracts.find(
    (contract) => contract._id === transfer.contract,
  );
  return contract?.name;
}

/**
 *
 * There's a bit of an assumption that Genie Swap always uses ETH, if that
 * assumption is wrong then there is more work to be done here to find the
 * matching token.
 */
function getErc20Data(
  contracts: Types.Contract.ERC20Contract[],
  erc20Transfers: TokenTransfer[],
  nftTransferFrom: string,
  nftTransferTo: string,
  price: string,
  taker: string,
) {
  const data: {
    erc20Contract: string | undefined;
    erc20Symbol: string | undefined;
    erc20Name: string | undefined;
    erc20Decimals: number | undefined;
  } = {
    erc20Contract: undefined,
    erc20Symbol: undefined,
    erc20Name: undefined,
    erc20Decimals: undefined,
  };

  if (erc20Transfers.length) {
    const erc20Transfer = erc20Transfers.find((transfer) => {
      if (NFT_MARKETPLACE_AGGREGATORS.includes(taker.toLowerCase())) {
        return (
          transfer.from === nftTransferTo &&
          transfer.to === taker.toLowerCase() &&
          transfer.amount === price
        );
      }
      if (X2Y2.PROXY.ADDRESS === transfer.to.toLowerCase()) {
        return transfer.from === nftTransferTo && transfer.amount === price;
      }
      return (
        transfer.from === nftTransferTo &&
        transfer.to === nftTransferFrom &&
        transfer.amount === price
      );
    });

    if (erc20Transfer) {
      const contract = contracts.find(
        (contract) => contract._id === erc20Transfer.contract,
      );

      data.erc20Contract = erc20Transfer.contract;
      data.erc20Decimals = contract?.decimals;
      data.erc20Symbol = contract?.symbol;
      data.erc20Name = contract?.name;
    }
  }

  return data;
}

/**
 * Filter out irrelevant ERC-721 transfers from common NFT swap contracts
 */
function filterTransfers(
  nftTransfers: NftTransfer[],
  maker: string,
  taker: string,
  tokenId: string,
) {
  if (NFT_MARKETPLACE_AGGREGATORS.includes(taker.toLowerCase())) {
    return nftTransfers.filter(
      (transfer) =>
        transfer.from === maker.toLowerCase() && transfer.tokenId === tokenId,
    );
  }
  return nftTransfers.filter((transfer) => {
    return (
      (transfer.from === maker.toLowerCase() &&
        transfer.to === taker.toLowerCase()) ||
      (transfer.to === maker.toLowerCase() &&
        transfer.from === taker.toLowerCase() &&
        tokenId === transfer.tokenId)
    );
  });
}

export default decodeX2Y2Sales;
