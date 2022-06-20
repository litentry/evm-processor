import { Types } from 'indexer-utils';

type ERC20 = {
  type: Types.Contract.ContractType.ERC20;
  data: Types.Contract.ERC20Contract;
};
type ERC721 = {
  type: Types.Contract.ContractType.ERC721;
  data: Types.Contract.ERC721Contract;
};
type ERC1155 = {
  type: Types.Contract.ContractType.ERC1155;
  data: Types.Contract.ERC1155Contract;
};
type UNISWAPV2 = {
  type: Types.Contract.ContractType.UNISWAPV2;
  data: Types.Contract.UniswapV2Contract;
};
type UNISWAPV3 = {
  type: Types.Contract.ContractType.UNISWAPV3;
  data: Types.Contract.UniswapV3Contract;
};

export type Model = ERC20 | ERC721 | ERC1155 | UNISWAPV2 | UNISWAPV3;

export type TransformResult = {
  ERC20: Types.Contract.ERC20Contract[];
  ERC721: Types.Contract.ERC721Contract[];
  ERC1155: Types.Contract.ERC1155Contract[];
  UNISWAPV2: Types.Contract.UniswapV2Contract[];
  UNISWAPV3: Types.Contract.UniswapV3Contract[];
};
