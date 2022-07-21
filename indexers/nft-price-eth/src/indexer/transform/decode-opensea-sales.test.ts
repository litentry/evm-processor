import extractedBlock14000004 from '../../test-data/extracted-block-14000004.json';
import { ExtractedNFTPriceData } from '../types';
import decodeOpenseaSales from './decode-opensea-sales';

describe('decodeOpenseaSales', () => {
  it('Decodes the logs and transforms the data into Sale models', () => {
    const result = decodeOpenseaSales(
      extractedBlock14000004 as unknown as ExtractedNFTPriceData['opensea'],
    );

    expect(result).toStrictEqual({
      sales: [
        {
          _id: '0xd59f84.0x43.86',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0x0ff2df411da13878c3c04165cc61c78304f785c9d63060b3c29b2d0d49b6bc32',
          contract: '0xe785e82358879f061bc3dcac6f0444462d4b5330',
          from: '0x4106a756c86f2ce6dc667cc9f4d68bd1b0472f3c',
          to: '0xe5cb166853ae703106c561c78b8f33b9af81ec5e',
          tokenId: '7027',
          collectionName: 'World Of Women',
          price: '7500000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x46.99',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0xc297f8267a4e0eaaf5ef165cf1939d2db4a854bd17157a6fcb1a32c0f6113962',
          contract: '0x0811f26c17284b6e331beaa2328471107576e601',
          from: '0x1bbdb608486cba131671d3b3ea72f058946154aa',
          to: '0x60ae40d3259b8d225f8055e98a5232d70949ab5d',
          tokenId: '3331',
          collectionName: 'Undead Pastel Club',
          price: '455000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x55.140',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0xc2227ca96716461c950ee5faf57ba41572af5ff3519ddc75e6700e9b6a6abbaf',
          contract: '0xed5af388653567af2f388e6224dc7c4b3241c544',
          from: '0xdb17829e3b877353830b4576a071c3b1c1b73416',
          to: '0x6554ac8069938943ea3f9acd7edc42c3b68850f7',
          tokenId: '4644',
          collectionName: 'Azuki',
          price: '2650000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x58.144',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0x70a23662e23bcadb903f57e273b69b29ec133e0c94242ab48b8f25b31bccc115',
          contract: '0x8cd3cea52a45f30ed7c93a63fb2b5c13b453d5a1',
          from: '0xdcd0f3a9e286f15ec534bf85d82fca936265bf1f',
          to: '0xafd1e0562c91a933f4b40154045cee71939e95ea',
          tokenId: '3189',
          collectionName: 'Rebel Society',
          price: '100000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x5b.153',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          collectionName: undefined,
          transactionHash:
            '0x61fd9216d6637bac8da9d62e3d4f7e5dd3d9a9fff68c8c5b438bd0f644aa2099',
          contract: '0xb228d7b6e099618ca71bd5522b3a8c3788a8f172',
          from: '0x7c802333563a2ed07eb847f09c0c8726a283d6f9',
          to: '0xb17dcfed5f534d684ab1cbba86c525da0c0f053f',
          tokenId: '2000',
          price: '1600000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x5e.168',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0x752e4cc5c6b5648838cf9e1c4f127e5e5599515f4c684838c0fe662a6e89098d',
          contract: '0x8c5029957bf42c61d19a29075dc4e00b626e5022',
          from: '0x58a7e8ebe736746edbcce09e2af8de252c69c306',
          to: '0x8ba94e82c41e9120a702b0e64abf218425d61e76',
          tokenId: '9269',
          collectionName: 'Alpha Girl Club',
          price: '180000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
        {
          _id: '0xd59f84.0x6e.198',
          blockNumber: 14000004,
          blockTimestamp: 1642114850,
          transactionHash:
            '0xae10422fcf543f06eeff63c5d649a469eddeeb37b924abedb063cf7c216ea3a1',
          contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
          from: '0xad31c65d25aad616479decdbc746efd597219d14',
          to: '0x5522c5479f0761127facc6a763d6f964ae1ceefe',
          tokenId: '14588',
          collectionName: 'MutantApeYachtClub',
          price: '15000000000000000000',
          erc20Contract: undefined,
          erc20Decimals: undefined,
          erc20Name: undefined,
          erc20Symbol: undefined,
        },
      ],
      missingContracts: [{ _id: '0xb228d7b6e099618ca71bd5522b3a8c3788a8f172' }],
      mismatchedTransfers: [],
    });
  });
});
