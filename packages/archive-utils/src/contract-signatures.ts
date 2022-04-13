import getMethodIdFromSignature from './utils/get-method-id-from-signature';
import getParamsFromSignature from './utils/get-params-from-signature';
import { ContractType } from './types';
/*
This file is a bit complicated, but the aim is to just maintain SIMPLE_CONTRACT_SIGNATURES, where all the required and optional signatures are added by us (as well as new contract types).

We return the ContractSignatures type and assign it to CONTRACT_SIGNATURES. Each signature object has:

1. The readable version
2. The ID (first 8 characters of the hash, used to index transaction types in the archive)
3. The params as an array (for decoding transaction input in indexers)
4. Required, used along with the ID to identifying contract types in contract creation transactions

The ugly uppercase is because these are constants. Apologies but it's important to keep that clear.
 */

type SimpleContractSignatures = {
  [key in ContractType]: {
    EVENTS: {
      REQUIRED: string[];
      OPTIONAL: string[];
    };
    EXTRINSICS: {
      REQUIRED: string[];
      OPTIONAL: string[];
    };
  };
};

type ContractSignatureItem = {
  SIGNATURE: string;
  ID: string;
  PARAMS: string[];
  REQUIRED: boolean;
};

type ContractSignatures = {
  [key in ContractType]: {
    EVENTS: ContractSignatureItem[];
    EXTRINSICS: ContractSignatureItem[];
  };
};

const SIMPLE_CONTRACT_SIGNATURES: SimpleContractSignatures = {
  //  https://eips.ethereum.org/EIPS/eip-20
  ERC20: {
    EVENTS: {
      REQUIRED: [
        'Transfer(address,address,uint256)',
        'Approval(address,address,uint256)',
      ],
      OPTIONAL: [],
    },
    EXTRINSICS: {
      REQUIRED: [
        'totalSupply()',
        'balanceOf(address)',
        'allowance(address,address)',
        'transfer(address,uint256)',
        'approve(address,uint256)',
        'transferFrom(address,address,uint256)',
      ],
      OPTIONAL: ['name()', 'symbol()', 'decimals()'],
    },
  },
  // https://eips.ethereum.org/EIPS/eip-721
  ERC721: {
    EVENTS: {
      REQUIRED: [
        'Transfer(address,address,uint256)',
        'Approval(address,address,uint256)',
        'ApprovalForAll(address,address,bool)',
      ],
      OPTIONAL: [],
    },
    EXTRINSICS: {
      REQUIRED: [
        'balanceOf(address)',
        'ownerOf(uint256)',
        'safeTransferFrom(address,address,uint256)',
        'safeTransferFrom(address,address,uint256,bytes)',
        'transferFrom(address,address,uint256)',
        'approve(address,uint256)',
        'setApprovalForAll(address,bool)',
        'isApprovedForAll(address,address)',
        'getApproved(uint256)',
      ],
      OPTIONAL: [
        // ERC721TokenReceiver
        'onERC721Received(address,address,uint256,bytes)',
        // ERC721Metadata
        'tokenURI(uint256)',
        'name()',
        'symbol()',
        // ERC721Enumerable
        'totalSupply()',
        'tokenByIndex(uint256)',
        'tokenOfOwnerByIndex(address,uint256)',
      ],
    },
  },
  // https://eips.ethereum.org/EIPS/eip-1155
  ERC1155: {
    EVENTS: {
      REQUIRED: [
        'TransferSingle(address,address,address,uint256,uint256)',
        'TransferBatch(address,address,address,uint256[],uint256[])',
        'ApprovalForAll(address,address,bool)',
      ],
      OPTIONAL: [
        // Listed with required events but is only relevant to optional ERC1155Metadata_URI interface
        'URI(string,uint256)',
      ],
    },
    EXTRINSICS: {
      REQUIRED: [
        'safeTransferFrom(address,address,uint256,uint256,bytes)',
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
        'balanceOf(address,uint256)',
        'balanceOfBatch(address[],uint256[])',
        'setApprovalForAll(address,bool)',
        'isApprovedForAll(address,address)',
      ],
      OPTIONAL: [
        // ERC1155TokenReceiver
        'onERC1155Received(address,address,uint256,uint256,bytes)',
        'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)',
        // ERC1155Metadata_URI
        'uri(uint256)',
      ],
    },
  },
};

export const CONTRACT_SIGNATURES = Object.keys(
  SIMPLE_CONTRACT_SIGNATURES
).reduce(
  (result, key) => ({
    ...result,
    [key]: {
      EVENTS: createSignatureItemArray(key as ContractType, 'EVENTS'),
      EXTRINSICS: createSignatureItemArray(key as ContractType, 'EXTRINSICS'),
    },
  }),
  {} as ContractSignatures
);

function createSignatureItemArray(
  contract: ContractType,
  type: 'EVENTS' | 'EXTRINSICS'
) {
  return [
    ...SIMPLE_CONTRACT_SIGNATURES[contract][type].REQUIRED.map((signature) =>
      createSignatureItem(signature, true)
    ),
    ...SIMPLE_CONTRACT_SIGNATURES[contract][type].OPTIONAL.map((signature) =>
      createSignatureItem(signature, false)
    ),
  ];
}

function createSignatureItem(signature: string, required: boolean) {
  return {
    REQUIRED: required,
    SIGNATURE: signature,
    ID: getMethodIdFromSignature(signature),
    PARAMS: getParamsFromSignature(signature),
  };
}
