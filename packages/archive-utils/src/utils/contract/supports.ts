import { CONTRACT_SIGNATURES } from './contract-signatures';
import { ContractSignatureItem } from '../../types/contract';

const ERC721TokenReceiverSig = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.find(
  (sig) => sig.SIGNATURE === 'onERC721Received(address,address,uint256,bytes)'
)!;
const ERC721MetadataSigs = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.filter((sig) =>
  ['tokenURI(uint256)', 'name()', 'symbol()'].includes(sig.SIGNATURE)
);
const ERC721EnumerableSigs = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.filter(
  (sig) =>
    [
      'totalSupply()',
      'tokenByIndex(uint256)',
      'tokenOfOwnerByIndex(address,uint256)',
    ].includes(sig.SIGNATURE)
);
const ERC1155TokenReceiverSigs = CONTRACT_SIGNATURES.ERC1155.EXTRINSICS.filter(
  (sig) =>
    [
      'onERC1155Received(address,address,uint256,uint256,bytes)',
      'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)',
    ].includes(sig.SIGNATURE)
);

const ERC1155Metadata_URISig = CONTRACT_SIGNATURES.ERC721.EXTRINSICS.find(
  (sig) => sig.SIGNATURE === 'uri(uint256)'
)!;

export default {
  ERC721Enumerable: (sigs: string[]) => supports(ERC721EnumerableSigs, sigs),
  ERC721TokenReceiver: (sigs: string[]) =>
    supports([ERC721TokenReceiverSig], sigs),
  ERC721Metadata: (sigs: string[]) => supports(ERC721MetadataSigs, sigs),
  ERC1155Metadata_URI: (sigs: string[]) =>
    supports([ERC1155Metadata_URISig], sigs),
  ERC1155TokenReceiver: (sigs: string[]) =>
    supports(ERC1155TokenReceiverSigs, sigs),
};

function supports(
  interfaceSigs: ContractSignatureItem[],
  contractSigs: string[]
) {
  return interfaceSigs.every((sig) => {
    return contractSigs.includes(sig.ID) || contractSigs.includes(sig._ID);
  });
}
