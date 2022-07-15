export const OPENSEA_WYVERN = {
  EVENT_HASH:
    '0xc4109843e0b7d514e4c093114b863f8e7d8d9a458c372cd51bfe526b588006c9',
  SIGNATURE: 'OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)',
  ABI: [
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: 'buyHash', type: 'bytes32' },
        { indexed: false, name: 'sellHash', type: 'bytes32' },
        { indexed: true, name: 'maker', type: 'address' },
        { indexed: true, name: 'taker', type: 'address' },
        { indexed: false, name: 'price', type: 'uint256' },
        { indexed: true, name: 'metadata', type: 'bytes32' },
      ],
      name: 'OrdersMatched',
      type: 'event',
    },
  ],
  V1: {
    DEPLOYMENT_BLOCK: 5774644,
    ADDRESS: '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b',
  },
  V2: {
    DEPLOYMENT_BLOCK: 14120913,
    ADDRESS: '0x7f268357a8c2552623316e2562d90e642bb538e5',
  },
};

export const TRANSFER = {
  ID: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  SIGNATURE: 'Transfer(address,address,uint256)',
};

export const TRANSFER_SINGLE = {
  ID: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  SIGNATURE: 'TransferSingle(address,address,address,uint256,uint256)',
};

export const TRANSFER_BATCH = {
  ID: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
  SIGNATURE: 'TransferBatch(address,address,address,uint256[],uint256[])',
};

export const GENIE_SWAP = '0x0a267cf51ef038fc00e71801f5a524aec06e4f07';
export const GEM_SCC_2 = '0x0000000035634b55f3d99b071b5a354f48e10bef';
export const GEM_SCC_3 = '0x00000000a50bb64b4bbeceb18715748dface08af';
export const GEM_SWAP = '0xf24629fbb477e10f2cf331c2b7452d8596b5c7a5';
export const GEM_SWAP_V2 = '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2';

export const NFT_MARKETPLACE_AGGREGATORS = [
  GEM_SCC_2,
  GEM_SCC_3,
  GEM_SWAP,
  GEM_SWAP_V2,
  GENIE_SWAP,
];
