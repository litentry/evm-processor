import { CONTRACT_SIGNATURES } from './contract-signatures';
import { ContractSignatureItem } from '../../types/contract';

const ERC721TokenReceiverSig = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.find(
  (sig) => sig.SIGNATURE === 'onERC721Received(address,address,uint256,bytes)',
)!;
const ERC721MetadataSigs = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.filter((sig) =>
  ['tokenURI(uint256)', 'name()', 'symbol()'].includes(sig.SIGNATURE),
);
const ERC721EnumerableSigs = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.filter(
  (sig) =>
    [
      'totalSupply()',
      'tokenByIndex(uint256)',
      'tokenOfOwnerByIndex(address,uint256)',
    ].includes(sig.SIGNATURE),
);
const ERC1155TokenReceiverSigs = CONTRACT_SIGNATURES.ERC1155.EXTRINSICS.filter(
  (sig) =>
    [
      'onERC1155Received(address,address,uint256,uint256,bytes)',
      'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)',
    ].includes(sig.SIGNATURE),
);

const ERC1155Metadata_URISig = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.find(
  (sig) => sig.SIGNATURE === 'uri(uint256)',
)!;

export default {
  ERC721Enumerable: (input: string) => supports(ERC721EnumerableSigs, input),
  ERC721TokenReceiver: (input: string) =>
    supports([ERC721TokenReceiverSig], input),
  ERC721Metadata: (input: string) => supports(ERC721MetadataSigs, input),
  ERC1155Metadata_URI: (input: string) =>
    supports([ERC1155Metadata_URISig], input),
  ERC1155TokenReceiver: (input: string) =>
    supports(ERC1155TokenReceiverSigs, input),
};

function supports(interfaceSigs: ContractSignatureItem[], input: string) {
  return interfaceSigs.every((sig) => {
    return input.includes(sig.ID) || input.includes(sig._ID);
  });
}
