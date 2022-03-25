export const UNISWAP = {
  TRANSFER_CALL: {
    SIGNATURE: 'Transfer(address,address,uint256)',
    ID: 'ddf252ad',
  },
  V3_CONTRACT_ADDRESS: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
  V3_MULTICALL: {
    SIGNATURE: 'multicall(uint256,bytes[])',
    NAME: 'multicall',
    ID: '5ae401dc',
    PARAMS: ['uint256', 'bytes[]'],
  },
  // these are V2 methods, but without deadline (uint256) as last param
  V3_MULTICALL_SWAP_METHODS: [
    {
      SIGNATURE: 'swapTokensForExactETH(uint256,uint256,address[],address)',
      NAME: 'swapTokensForExactETH',
      ID: '3e8877ed',
      PARAMS: ['uint256', 'uint256', 'address[]', 'address'],
    },
    {
      SIGNATURE: 'swapExactETHForTokens(uint256,address[],address)',
      NAME: 'swapExactETHForTokens',
      ID: '12c6442f',
      PARAMS: ['uint256', 'address[]', 'address'],
    },
    {
      SIGNATURE: 'swapTokensForExactTokens(uint256,uint256,address[],address)',
      NAME: 'swapTokensForExactTokens',
      ID: '42712a67',
      PARAMS: ['uint256', 'uint256', 'address[]', 'address'],
    },
    {
      SIGNATURE: 'swapExactTokensForTokens(uint256,uint256,address[],address)',
      NAME: 'swapExactTokensForTokens',
      ID: '472b43f3',
      PARAMS: ['uint256', 'uint256', 'address[]', 'address'],
    },
    {
      SIGNATURE: 'swapExactTokensForETH(uint256,uint256,address[],address)',
      NAME: 'swapExactTokensForETH',
      ID: '363db5c6',
      PARAMS: ['uint256', 'uint256', 'address[]', 'address'],
    },
    {
      SIGNATURE: 'swapETHForExactTokens(uint256,address[],address)',
      NAME: 'swapTokensForExactETH',
      ID: '10086982',
      PARAMS: ['uint256', 'address[]', 'address'],
    },
  ],
};
