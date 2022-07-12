import { ExtractedNFTData, TransformedNFTData } from '../types';
import decodeErc1155BatchTokenTransfers from './decode-erc1155-batch-token-transfers';
import decodeErc1155SingleTokenTransfers from './decode-erc1155-single-token-transfers';
import decodeErc721TokenTransfers from './decode-erc721-token-transfers';
import mapErc1155TransfersToTokens from './map-erc1155-transfers-to-tokens';
import mapErc721TransfersToTokens from './map-erc721-transfers-to-tokens';

export default function transform(data: ExtractedNFTData): TransformedNFTData {
  // decode transfers
  const erc721TokenTransfers = decodeErc721TokenTransfers(
    data.erc721TransferLogs,
    data.erc721Contracts,
  );
  const singleErc1155TokenTransfers = decodeErc1155SingleTokenTransfers(
    data.erc1155TransferSingleLogs,
    data.erc1155Contracts,
  );
  const batchErc1155TokenTransfers = decodeErc1155BatchTokenTransfers(
    data.erc1155TransferBatchLogs,
    data.erc1155Contracts,
  );
  const erc1155TokenTransfers = [
    ...singleErc1155TokenTransfers,
    ...batchErc1155TokenTransfers,
  ];

  // map transfers to tokens
  return {
    erc721Tokens: mapErc721TransfersToTokens(erc721TokenTransfers),
    erc721TokenTransfers,
    erc1155Tokens: mapErc1155TransfersToTokens(erc1155TokenTransfers),
    erc1155TokenTransfers,
  };
}
