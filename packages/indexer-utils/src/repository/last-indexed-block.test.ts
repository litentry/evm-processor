import * as indexedBlockRangeRepository from './indexed-block-range';
import * as repository from './last-indexed-block';

beforeEach(async () => {
  await repository.save(10);
});

afterEach(async () => {
  await repository.Model.deleteMany();
});

describe('Indexed block range repository', () => {
  it('Should get last indexed block', async () => {
    expect(await repository.get()).toStrictEqual(10);
  });

  it('Should save last indexed block', async () => {
    expect(await repository.get()).toStrictEqual(10);

    await repository.save(20);

    expect(await repository.get()).toStrictEqual(20);
  });

  it('Should calculate lastIndexedBlock through ranges and update', async () => {
    indexedBlockRangeRepository.save(11, 20);
    indexedBlockRangeRepository.save(21, 30);
    indexedBlockRangeRepository.save(41, 50);
    indexedBlockRangeRepository.save(100, 20300);

    await repository.calculateAndUpdate();

    expect(await repository.get()).toStrictEqual(30);
  });
});
