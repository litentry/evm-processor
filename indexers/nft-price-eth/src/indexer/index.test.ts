import index from './index';
import { utils } from 'indexer-utils';
import { NFTSaleModel } from '../schema';

describe('indexer', () => {
  const upsertSpy = jest.spyOn(utils, 'upsertMongoModels');

  it('should load good known block into Mongo containing X2Y2 SC blocks', async () => {
    process.env.ARCHIVE_GRAPH =
      'https://ethereum-archive-beta.graph.eng.litentry.io/graphql';
    process.env.CONTRACT_GRAPH =
      'https://ethereum-contracts-beta.graph.eng.litentry.io/graphql';
    const result = await index(15102307, 15102307);
    expect(upsertSpy).toHaveBeenNthCalledWith(
      1,
      NFTSaleModel,
      {
        '0': {
          _id: '0xe67163.0xce.273',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
          transactionId: '0xe67163.0xce',
          contract: '0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124',
          from: '0xf6e16701911c6c2a15307e621c2a77cb82ed02a2',
          to: '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2',
          tokenId: '155',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'goodblocks',
          price: '3000000000000000',
        },
        '1': {
          _id: '0xe67163.0xce.279',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
          transactionId: '0xe67163.0xce',
          contract: '0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124',
          from: '0xf6e16701911c6c2a15307e621c2a77cb82ed02a2',
          to: '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2',
          tokenId: '156',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'goodblocks',
          price: '3000000000000000',
        },
        '2': {
          _id: '0xe67163.0xce.285',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
          transactionId: '0xe67163.0xce',
          contract: '0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124',
          from: '0x8dd3cbfe20968d6ff0ad5b86f40f7e4f0c1fdd58',
          to: '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2',
          tokenId: '158',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'goodblocks',
          price: '3000000000000000',
        },
        '3': {
          _id: '0xe67163.0xce.291',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
          transactionId: '0xe67163.0xce',
          contract: '0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124',
          from: '0x9dd9d93c01c84203e3f8292e0691c4a7926e5c69',
          to: '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2',
          tokenId: '164',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'goodblocks',
          price: '3000000000000000',
        },
        '4': {
          _id: '0xe67163.0xce.297',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
          transactionId: '0xe67163.0xce',
          contract: '0x29b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124',
          from: '0x9dd9d93c01c84203e3f8292e0691c4a7926e5c69',
          to: '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2',
          tokenId: '163',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'goodblocks',
          price: '3000000000000000',
        },
        '5': {
          _id: '0xe67163.0xde.340',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x09558f8532e81509688c0389401facf1bc7cf1d5578d8d3f9f0fc7491ac9adad',
          transactionId: '0xe67163.0xde',
          contract: '0x35f3b8f37e9341f289398b70fa2c576dd102df75',
          from: '0x8473822c22e70565be9ffc131bcafaba7bd17209',
          to: '0xdc702604a1bd2372333a445bd4cf571e2d050231',
          tokenId: '7488',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'BALUBA',
          price: '8900000000000000',
        },
        '6': {
          _id: '0xe67163.0xf1.389',
          blockNumber: 15102307,
          blockTimestamp: 1657288805,
          transactionHash:
            '0x31717ce86a73dd0aacbcff36edc7ecb6802815bd6060c3e6a62a2d8a2e9d5c50',
          transactionId: '0xe67163.0xf1',
          contract: '0x35f3b8f37e9341f289398b70fa2c576dd102df75',
          from: '0x8473822c22e70565be9ffc131bcafaba7bd17209',
          to: '0xa37dd822890beeb2892cfa59c423016205f0a642',
          tokenId: '7486',
          erc20Contract: undefined,
          erc20Symbol: undefined,
          erc20Name: undefined,
          erc20Decimals: undefined,
          collectionName: 'BALUBA',
          price: '8900000000000000',
        },
      },
      ['_id'],
    );
    expect(result).toBeUndefined();
  });
  it('should load good known block into Mongo containing X2Y2 SC blocks with a wETH transfer', async () => {
    process.env.ARCHIVE_GRAPH =
      'https://ethereum-archive-beta.graph.eng.litentry.io/graphql';
    process.env.CONTRACT_GRAPH =
      'https://ethereum-contracts-beta.graph.eng.litentry.io/graphql';
    const result = await index(15185616, 15185616);
    // @ts-ignore
    upsertSpy.mockImplementation((...args) => console.log(args));
    expect(upsertSpy).toHaveBeenNthCalledWith(
      1,
      NFTSaleModel,
      {
        '0': {
          _id: '0xe7b6d0.0x206.204',
          blockNumber: 15185616,
          blockTimestamp: 1658402832,
          collectionName: 'Etherjump Plots',
          contract: '0xd2669aefca82e23d1b0a94459deafd656f6b719a',
          erc20Contract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          erc20Decimals: 18,
          erc20Name: 'Wrapped Ether',
          erc20Symbol: 'WETH',
          from: '0x5e2eabfaddf49615f84734724b77eeeebc5ebd71',
          price: '109000000000000000',
          to: '0x81957acf8606238063700c3098bf1090f9d771bd',
          tokenId: '565',
          transactionHash:
            '0x5db98f2cb2ac24c45e7a18011637dbfa2d8e8f9d5f541154685ea7790e2eb217',
          transactionId: '0xe7b6d0.0x206',
        },
        '1': {
          _id: '0xe7b6d0.0x21a.272',
          blockNumber: 15185616,
          blockTimestamp: 1658402832,
          collectionName: 'dontletmedoit',
          contract: '0xe82c0828ff43e58ec10009b379aeb6296ae9d104',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
          from: '0xda3daf9d6b742b028e3e644b42d08a3f70817a94',
          price: '10000000000000000',
          to: '0x60f3f6b8eac2fa8168f6172d76c80b5d617b9f63',
          tokenId: '575',
          transactionHash:
            '0x73f3decd0e1f9255051253950bbbbebd38785d903117950aa6bf06ea77784867',
          transactionId: '0xe7b6d0.0x21a',
        },
      },
      ['_id'],
    );
    expect(result).toBeUndefined();
  });
});
