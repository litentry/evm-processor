import createBatches from './create-batches';

describe('Create batches', () => {
  it('Creates batches', () => {
    expect(createBatches(0, 122, 20)).toStrictEqual([
      { startBlock: 0, endBlock: 19 },
      { startBlock: 20, endBlock: 39 },
      { startBlock: 40, endBlock: 59 },
      { startBlock: 60, endBlock: 79 },
      { startBlock: 80, endBlock: 99 },
      { startBlock: 100, endBlock: 119 },
      { startBlock: 120, endBlock: 122 },
    ]);
  });
});
