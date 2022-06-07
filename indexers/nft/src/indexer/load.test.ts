import load from './load';
import { ERC1155TokenModel, ERC721TokenModel } from '../schema';

const nfts = [
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 2,
    lastTransferedBlockTimestamp: 2,
    owner: 'a',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 3,
    lastTransferedBlockTimestamp: 3,
    owner: 'b',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 5,
    lastTransferedBlockTimestamp: 5,
    owner: 'c',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 4,
    lastTransferedBlockTimestamp: 4,
    owner: 'd',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 1,
    lastTransferedBlockTimestamp: 1,
    owner: 'e',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 6,
    lastTransferedBlockTimestamp: 6,
    owner: 'f',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 10,
    lastTransferedBlockTimestamp: 10,
    owner: 'g',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 9,
    lastTransferedBlockTimestamp: 9,
    owner: 'h',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 8,
    lastTransferedBlockTimestamp: 8,
    owner: 'i',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 7,
    lastTransferedBlockTimestamp: 7,
    owner: 'j',
    tokenId: '721-token-id',
  },
  {
    contract: '721-contract-address',
    lastTransferedBlockNumber: 7,
    lastTransferedBlockTimestamp: 7,
    owner: 'k',
    tokenId: '721-token-id-2',
  },
];

const sfts = [
  {
    contract: '1155-contract-address',
    lastTransferedBlockNumber: 1,
    lastTransferedBlockTimestamp: 1,
    owner: '0x00',
    tokenId: '1155-token-id',
    quantity: -2,
  },
  {
    contract: '1155-contract-address',
    lastTransferedBlockNumber: 1,
    lastTransferedBlockTimestamp: 1,
    owner: 'a',
    tokenId: '1155-token-id',
    quantity: 2,
  },
  {
    contract: '1155-contract-address',
    lastTransferedBlockNumber: 2,
    lastTransferedBlockTimestamp: 2,
    owner: 'a',
    tokenId: '1155-token-id',
    quantity: -2,
  },
  {
    contract: '1155-contract-address',
    lastTransferedBlockNumber: 2,
    lastTransferedBlockTimestamp: 2,
    owner: 'b',
    tokenId: '1155-token-id',
    quantity: 2,
  },
];

describe('load', () => {
  it('Ensures we only get the latest ERC721 owner', async () => {
    await ERC721TokenModel.createIndexes();

    await load({
      sfts: [],
      nfts,
    });

    const results = await ERC721TokenModel.find({});

    expect(
      results.map((doc) => ({
        contract: doc.contract,
        lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
        lastTransferedBlockTimestamp: doc.lastTransferedBlockTimestamp,
        owner: doc.owner,
        tokenId: doc.tokenId,
      })),
    ).toStrictEqual([
      {
        contract: '721-contract-address',
        lastTransferedBlockNumber: 10,
        lastTransferedBlockTimestamp: 10,
        owner: 'g', // only the latest owner for this token
        tokenId: '721-token-id',
      },
      {
        contract: '721-contract-address',
        lastTransferedBlockNumber: 7,
        lastTransferedBlockTimestamp: 7,
        owner: 'k', // only owner or this token
        tokenId: '721-token-id-2',
      },
    ]);
  });

  it('Ensures ERC1155 quantities per owner and adjusted correctly', async () => {
    await ERC1155TokenModel.createIndexes();

    await load({
      sfts,
      nfts: [],
    });

    const results = await ERC1155TokenModel.find({});
    console.log(
      results.map((doc) => ({
        lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
        quantity: doc.quantity,
        owner: doc.owner,
      })),
    );

    expect(
      results
        .map((doc) => ({
          contract: doc.contract,
          lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
          lastTransferedBlockTimestamp: doc.lastTransferedBlockTimestamp,
          quantity: doc.quantity,
          owner: doc.owner,
          tokenId: doc.tokenId,
        }))
        .sort((a, b) => {
          return a.quantity - b.quantity;
        }),
    ).toStrictEqual([
      {
        contract: '1155-contract-address',
        lastTransferedBlockNumber: 1,
        lastTransferedBlockTimestamp: 1,
        owner: '0x00',
        tokenId: '1155-token-id',
        quantity: -2,
      },
      {
        contract: '1155-contract-address',
        lastTransferedBlockNumber: 2,
        lastTransferedBlockTimestamp: 2,
        owner: 'a',
        tokenId: '1155-token-id',
        quantity: 0,
      },
      {
        contract: '1155-contract-address',
        lastTransferedBlockNumber: 2,
        lastTransferedBlockTimestamp: 2,
        owner: 'b',
        tokenId: '1155-token-id',
        quantity: 2,
      },
    ]);
  });
});
