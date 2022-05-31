import { ContractSignatureItem, ContractType } from '../../types/contract';
import getMethodIdFromSignature from './get-method-id-from-signature';
import getParamsFromSignature from './get-params-from-signature';
/*
This file is a bit complicated, but the aim is to just maintain SIMPLE_CONTRACT_SIGNATURES, where all the required and optional signatures are added by us (as well as new contract types).

We return the ContractSignatures type and assign it to CONTRACT_SIGNATURES. Each signature object has:

1. The readable version
2. The ID (first 8 characters of the hash, used to index transaction types in the archive)
3. The params as an array (for decoding transaction input in indexers)
4. Required, used along with the ID to identifying contract types in contract creation transactions
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

type ContractSignatures = {
  [key in ContractType]: {
    EVENTS: ContractSignatureItem[];
    EXTRINSICS: ContractSignatureItem[];
  };
};

const SIMPLE_CONTRACT_SIGNATURES: SimpleContractSignatures = {
  //  https://eips.ethereum.org/EIPS/eip-165
  ERC165: {
    EVENTS: {
      REQUIRED: [],
      OPTIONAL: [],
    },
    EXTRINSICS: {
      REQUIRED: ['supportsInterface(bytes4)'],
      OPTIONAL: [],
    },
  },
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
  // this is not a string standard, only the methods we care about are here
  // if we ever need to build on this the contract is here: https://etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#code
  UNISWAPV2: {
    EVENTS: {
      REQUIRED: [],
      OPTIONAL: [],
    },
    EXTRINSICS: {
      REQUIRED: [
        'swapTokensForExactETH(uint256,uint256,address[],address,uint256)',
        'swapExactETHForTokens(uint256,address[],address,uint256)',
        'swapTokensForExactTokens(uint256,uint256,address[],address,uint256)',
        'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
        'swapExactTokensForETH(uint256,uint256,address[],address,uint256)',
        'swapETHForExactTokens(uint256,address[],address,uint256)',
      ],
      OPTIONAL: [],
    },
  },
  // Original https://etherscan.io/address/0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45
  UNISWAPV3: {
    EVENTS: {
      REQUIRED: [],
      OPTIONAL: [],
    },
    EXTRINSICS: {
      REQUIRED: [
        'multicall(uint256,bytes[])',
        'swapTokensForExactETH(uint256,uint256,address[],address)',
        'swapExactETHForTokens(uint256,address[],address)',
        'swapTokensForExactTokens(uint256,uint256,address[],address)',
        'swapExactTokensForTokens(uint256,uint256,address[],address)',
        'swapExactTokensForETH(uint256,uint256,address[],address)',
        'swapETHForExactTokens(uint256,address[],address)',
      ],
      OPTIONAL: [],
    },
  },
};

export const CONTRACT_SIGNATURES = Object.keys(
  SIMPLE_CONTRACT_SIGNATURES,
).reduce(
  (result, key) => ({
    ...result,
    [key]: {
      EVENTS: createSignatureItemArray(key as ContractType, 'EVENTS'),
      EXTRINSICS: createSignatureItemArray(key as ContractType, 'EXTRINSICS'),
    },
  }),
  {} as ContractSignatures,
);

function createSignatureItemArray(
  contract: ContractType,
  type: 'EVENTS' | 'EXTRINSICS',
): ContractSignatureItem[] {
  return [
    ...SIMPLE_CONTRACT_SIGNATURES[contract][type].REQUIRED.map((signature) =>
      createSignatureItem(signature, true, type === 'EVENTS'),
    ),
    ...SIMPLE_CONTRACT_SIGNATURES[contract][type].OPTIONAL.map((signature) =>
      createSignatureItem(signature, false, type === 'EVENTS'),
    ),
  ];
}

function createSignatureItem(
  signature: string,
  required: boolean,
  events: boolean,
): ContractSignatureItem {
  return {
    REQUIRED: required,
    SIGNATURE: signature,
    ID: getMethodIdFromSignature(signature, events),
    PARAMS: getParamsFromSignature(signature),
  };
}
