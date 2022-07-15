import { BigNumber, ethers } from 'ethers';
import { Types } from 'indexer-utils';
import { NFT_MARKETPLACE_AGGREGATORS, OPENSEA_WYVERN } from '../constants';
import {
  ExtractedNFTPriceData,
  MismatchedTransfers,
  MissingContracts,
  NftTransfer,
  TokenTransfer,
  TransformedNFTPriceData,
} from '../types';
import decodeTransfers from './decode-transfers';

export default function decodeOpenseaSales(
  data: ExtractedNFTPriceData['opensea'],
): TransformedNFTPriceData {
  const mismatchedTransfers: MismatchedTransfers[] = [];
  const missingContracts: MissingContracts[] = [];
  const sales: Types.Nft.Sale[] = [];

  data.logs.forEach((log) => {
    const decoded = new ethers.utils.Interface(
      OPENSEA_WYVERN.ABI,
    ).decodeEventLog(OPENSEA_WYVERN.SIGNATURE, log.data, [
      OPENSEA_WYVERN.EVENT_HASH,
      log.topic1!,
      log.topic2!,
      log.topic3!,
    ]) as unknown as {
      price: BigNumber;
      maker: string;
      taker: string;
    };

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
      decoded.maker,
      decoded.taker,
    );

    if (!filteredTransfers.length) {
      mismatchedTransfers.push({
        _id: log.transactionHash,
      });
      return;
    }

    const pricePerNft = decoded.price.div(filteredTransfers.length);

    const erc20Data = getErc20Data(
      data.associatedContracts.erc20,
      transfers.tokens,
      filteredTransfers[0].from,
      filteredTransfers[0].to,
      decoded.price.toString(),
      decoded.taker,
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

// There's a bit of an assumption that Genie Swap always uses ETH, if that assumption is wrong then there is more work to be done here to find the matching token.
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

/*
GenieSwap (0x0a267cf51ef038fc00e71801f5a524aec06e4f07) handles multiple NFT transfers in a single transaction. When this happens we need to make sure we assign the right ERC721 & ERC1155 logs to the right OrdersMatched log. To do this we match the NFT transfer logs by comparing the Opensea maker with the from parameter in the Transfer event.

It looks like only ETH is used by GenieSwap, if not we could try and match the ERC20 receiver with the Opensea seller.

https://etherscan.io/tx/0xd3e12521e196c658120bd4a6704e9527ee895564d44fc24a89215205e80dad16#eventlog

Also GemSwap is similar - and it does allow ERC 20 tokens
https://etherscan.io/tx/0x974926f8ecf571a64ba769285cf191573252afd75e2b49642051f4732996cdef#eventlog
*/
function filterTransfers(
  nftTransfers: NftTransfer[],
  maker: string,
  taker: string,
) {
  if (NFT_MARKETPLACE_AGGREGATORS.includes(taker.toLowerCase())) {
    return nftTransfers.filter(
      (transfer) => transfer.from === maker.toLowerCase(),
    );
  }
  return nftTransfers.filter((transfer) => {
    return (
      (transfer.from === maker.toLowerCase() &&
        transfer.to === taker.toLowerCase()) ||
      (transfer.to === maker.toLowerCase() &&
        transfer.from === taker.toLowerCase())
    );
  });
}
