import * as indexerUtils from 'indexer-utils';
import * as extract from './extract';

jest.spyOn(indexerUtils.query.tokenActivity, 'events');

describe('fetch721Events', () => {
  it('Fetches ERC721 transfer events', async () => {
    (indexerUtils.query.tokenActivity.events as jest.Mock).mockImplementation(
      () => {},
    );

    await extract.fetch721Events(1, 10);

    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledTimes(1);
    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledWith({
      blockRange: { end: 10, start: 1 },
      ercType: 721,
      properties: [
        'contract',
        'blockNumber',
        'blockTimestamp',
        'value1',
        'value2',
        'value3',
      ],
      signature: 'Transfer(address,address,uint256)',
    });
  });
});

describe('fetch1155Events', () => {
  it('Fetches ERC1155 transfer events', async () => {
    (indexerUtils.query.tokenActivity.events as jest.Mock).mockImplementation(
      () => {},
    );

    await extract.fetch1155Events(1, 10);

    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledTimes(1);
    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledWith({
      blockRange: { end: 10, start: 1 },
      ercType: 1155,
      properties: ['contract', 'value2', 'value3', 'value4', 'value5'],
      signature: 'TransferSingle(address,address,address,uint256,uint256)',
    });
  });
});

describe('fetch1155BatchEvents', () => {
  it('Fetches ERC1155 batch transfer events', async () => {
    (indexerUtils.query.tokenActivity.events as jest.Mock).mockImplementation(
      () => {},
    );

    await extract.fetch1155BatchEvents(1, 10);

    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledTimes(1);
    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledWith({
      blockRange: { end: 10, start: 1 },
      ercType: 1155,
      properties: ['contract', 'value2', 'value3', 'value4', 'value5'],
      signature: 'TransferBatch(address,address,address,uint256[],uint256[])',
    });
  });
});

describe('extract', () => {
  it('Fetches all NFT transfer events', async () => {
    (indexerUtils.query.tokenActivity.events as jest.Mock).mockImplementation(
      (input: any) => [input.ercType, input.signature],
    );

    const result = await extract.default(1, 10);

    expect(
      indexerUtils.query.tokenActivity.events as jest.Mock,
    ).toHaveBeenCalledTimes(3);

    expect(result).toStrictEqual({
      events721: [721, 'Transfer(address,address,uint256)'],
      eventsSingle1155: [
        1155,
        'TransferSingle(address,address,address,uint256,uint256)',
      ],
      eventsBatch1155: [
        1155,
        'TransferBatch(address,address,address,uint256[],uint256[])',
      ],
    });
  });
});
