import { Types } from 'indexer-utils';
import {
  ERC1155TokenModel,
  ERC1155TokenTransferModel,
  ERC721TokenModel,
  ERC721TokenTransferModel,
} from '../schema';
import load from './load';

const transactionHash = '0x123';
const transactionId = '1.1';

describe('load', () => {
  it('Ensures we only get the latest ERC721 owner for tokens, and saves transfers', async () => {
    const contract_721 = '721-contract-address';
    const tokenId_721 = '721-token-id';
    const _id_721 = `${contract_721}.${tokenId_721}`;

    const erc721TokenTransfers: Types.Nft.ERC721TokenTransfer[] = [
      {
        _id: '1',
        blockNumber: 1,
        blockTimestamp: 1,
        from: 'x',
        to: 'e',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
      {
        _id: '2',
        blockNumber: 2,
        blockTimestamp: 2,
        from: 'e',
        to: 'a',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
      {
        _id: '3',
        blockNumber: 3,
        blockTimestamp: 3,
        from: 'a',
        to: 'b',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
      {
        _id: '4',
        blockNumber: 4,
        blockTimestamp: 4,
        from: 'b',
        to: 'd',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
      {
        _id: '5',
        blockNumber: 5,
        blockTimestamp: 5,
        from: 'd',
        to: 'c',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
      {
        _id: '6',
        blockNumber: 6,
        blockTimestamp: 6,
        from: 'c',
        to: 'f',
        contract: contract_721,
        tokenId: tokenId_721,
        transactionHash,
        transactionId,
      },
    ];

    const erc721Tokens: Types.Nft.ERC721Token[] = [
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 2,
        lastTransferedBlockTimestamp: 2,
        owner: 'a',
        tokenId: tokenId_721,
      },
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 3,
        lastTransferedBlockTimestamp: 3,
        owner: 'b',
        tokenId: tokenId_721,
      },
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 5,
        lastTransferedBlockTimestamp: 5,
        owner: 'c',
        tokenId: tokenId_721,
      },
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 4,
        lastTransferedBlockTimestamp: 4,
        owner: 'd',
        tokenId: tokenId_721,
      },
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 1,
        lastTransferedBlockTimestamp: 1,
        owner: 'e',
        tokenId: tokenId_721,
      },
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 6,
        lastTransferedBlockTimestamp: 6,
        owner: 'f',
        tokenId: tokenId_721,
      },
      {
        _id: `${_id_721}-2`,
        contract: contract_721,
        lastTransferedBlockNumber: 7,
        lastTransferedBlockTimestamp: 7,
        owner: 'k',
        tokenId: `${tokenId_721}-2`,
      },
    ];

    await ERC721TokenModel.createIndexes();
    await ERC721TokenTransferModel.createIndexes();

    await load({
      erc721Tokens,
      erc721TokenTransfers,
      erc1155TokenTransfers: [],
      erc1155Tokens: [],
    });

    const transferResults = await ERC721TokenTransferModel.find({});
    expect(
      transferResults.map((doc) => ({
        _id: doc._id,
        contract: doc.contract,
        blockNumber: doc.blockNumber,
        blockTimestamp: doc.blockTimestamp,
        from: doc.from,
        to: doc.to,
        transactionHash: doc.transactionHash,
        transactionId: doc.transactionId,
        tokenId: doc.tokenId,
      })),
    ).toStrictEqual(erc721TokenTransfers);

    const tokenResults = await ERC721TokenModel.find({});
    expect(
      tokenResults.map((doc) => ({
        _id: doc._id,
        contract: doc.contract,
        lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
        lastTransferedBlockTimestamp: doc.lastTransferedBlockTimestamp,
        owner: doc.owner,
        tokenId: doc.tokenId,
      })),
    ).toStrictEqual([
      {
        _id: _id_721,
        contract: contract_721,
        lastTransferedBlockNumber: 6,
        lastTransferedBlockTimestamp: 6,
        owner: 'f', // only the latest owner for this token
        tokenId: tokenId_721,
      },
      {
        _id: `${_id_721}-2`,
        contract: contract_721,
        lastTransferedBlockNumber: 7,
        lastTransferedBlockTimestamp: 7,
        owner: 'k', // only owner or this token
        tokenId: `${tokenId_721}-2`,
      },
    ]);
  });

  it('Ensures ERC1155 quantities per owner and adjusted correctly, and saves transfers', async () => {
    const contract_1155 = '1155-contract-address';
    const tokenId_1155 = '1155-token-id';

    const erc1155TokenTransfers: Types.Nft.ERC1155TokenTransfer[] = [
      {
        _id: '1',
        quantity: '2',
        from: '0x00',
        to: 'a',
        contract: contract_1155,
        tokenId: tokenId_1155,
        blockNumber: 4,
        blockTimestamp: 4,
        transactionHash,
        transactionId,
      },
      {
        _id: '2',
        quantity: '2',
        from: 'a',
        to: 'b',
        contract: contract_1155,
        tokenId: tokenId_1155,
        blockNumber: 4,
        blockTimestamp: 4,
        transactionHash,
        transactionId,
      },
    ];

    const erc1155Tokens: Types.Nft.ERC1155Token[] = [
      {
        _id: `${contract_1155}.${tokenId_1155}.0x00`,
        contract: contract_1155,
        owner: '0x00',
        tokenId: tokenId_1155,
        quantity: '-2',
      },
      {
        _id: `${contract_1155}.${tokenId_1155}.a`,
        contract: contract_1155,
        owner: 'a',
        tokenId: tokenId_1155,
        quantity: '2',
      },
      {
        _id: `${contract_1155}.${tokenId_1155}.a`,
        contract: contract_1155,
        owner: 'a',
        tokenId: tokenId_1155,
        quantity: '-2',
      },
      {
        _id: `${contract_1155}.${tokenId_1155}.b`,
        contract: contract_1155,
        owner: 'b',
        tokenId: tokenId_1155,
        quantity: '2',
      },
    ];

    await ERC1155TokenModel.createIndexes();
    await ERC1155TokenTransferModel.createIndexes();

    await load({
      erc721Tokens: [],
      erc721TokenTransfers: [],
      erc1155TokenTransfers,
      erc1155Tokens,
    });

    const transferResults = await ERC1155TokenTransferModel.find({});
    expect(
      transferResults.map((doc) => ({
        _id: doc._id,
        contract: doc.contract,
        blockNumber: doc.blockNumber,
        blockTimestamp: doc.blockTimestamp,
        from: doc.from,
        to: doc.to,
        transactionHash: doc.transactionHash,
        transactionId: doc.transactionId,
        tokenId: doc.tokenId,
        quantity: doc.quantity,
      })),
    ).toStrictEqual(erc1155TokenTransfers);

    const tokenResults = await ERC1155TokenModel.find({});

    expect(
      tokenResults
        .map((doc) => ({
          _id: doc._id,
          contract: doc.contract,
          quantity: doc.quantity,
          owner: doc.owner,
          tokenId: doc.tokenId,
        }))
        .sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity)),
    ).toStrictEqual([
      {
        _id: `${contract_1155}.${tokenId_1155}.0x00`,
        contract: contract_1155,
        owner: '0x00',
        tokenId: tokenId_1155,
        quantity: '-2',
      },
      {
        _id: `${contract_1155}.${tokenId_1155}.a`,
        contract: contract_1155,
        owner: 'a',
        tokenId: tokenId_1155,
        quantity: '0',
      },
      {
        _id: `${contract_1155}.${tokenId_1155}.b`,
        contract: contract_1155,
        owner: 'b',
        tokenId: tokenId_1155,
        quantity: '2',
      },
    ]);
  });
});
