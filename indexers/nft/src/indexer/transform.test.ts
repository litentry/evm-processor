import { Types } from 'indexer-utils';
import transform from './transform';

const event721 = {
  contract: '721-contract-address',
  blockNumber: 10,
  blockTimestamp: 12345678,
  value2: 'new-owner',
  value3: '721-token-id',
} as Types.Contract.DecodedContractEvent;

const event1155Single = {
  contract: '1155-contract-address',
  value2: 'old-owner',
  value3: 'new-owner',
  value4: '1155-token-id',
  value5: '3',
} as Types.Contract.DecodedContractEvent;

const event1155Batch = {
  contract: '1155-batch-contract-address',
  value2: 'old-owner',
  value3: 'new-owner',
  value4: '1155-batch-token1,1155-batch-token2',
  value5: '3,2',
} as Types.Contract.DecodedContractEvent;

describe('transform', () => {
  const result = transform({
    events721: [event721],
    eventsSingle1155: [event1155Single],
    eventsBatch1155: [event1155Batch],
  });

  it('Should product NFT (721) models', () => {
    expect(result.nfts).toStrictEqual([
      {
        contract: '721-contract-address',
        lastTransferedBlockNumber: 10,
        lastTransferedBlockTimestamp: 12345678,
        owner: 'new-owner',
        tokenId: '721-token-id',
      },
    ]);
  });

  it('Should product SFT (1155) models from transfer single events', () => {
    expect(result.sfts.slice(0, 2)).toStrictEqual([
      {
        contract: '1155-contract-address',
        owner: 'old-owner',
        tokenId: '1155-token-id',
        quantity: -3,
      },
      {
        contract: '1155-contract-address',
        owner: 'new-owner',
        tokenId: '1155-token-id',
        quantity: 3,
      },
    ]);
  });

  it('Should product SFT (1155) models from transfer batch events', () => {
    expect(result.sfts.slice(2, 6)).toStrictEqual([
      {
        contract: '1155-batch-contract-address',
        owner: 'old-owner',
        tokenId: '1155-batch-token1',
        quantity: -3,
      },
      {
        contract: '1155-batch-contract-address',
        owner: 'new-owner',
        tokenId: '1155-batch-token1',
        quantity: 3,
      },
      {
        contract: '1155-batch-contract-address',
        owner: 'old-owner',
        tokenId: '1155-batch-token2',
        quantity: -2,
      },
      {
        contract: '1155-batch-contract-address',
        owner: 'new-owner',
        tokenId: '1155-batch-token2',
        quantity: 2,
      },
    ]);
  });

  it('Should have nothing else in the results', () => {
    expect(result.nfts.length).toBe(1);
    expect(result.sfts.length).toBe(6);
    expect(result).toStrictEqual({
      nfts: expect.any(Array),
      sfts: expect.any(Array),
    });
  });
});
