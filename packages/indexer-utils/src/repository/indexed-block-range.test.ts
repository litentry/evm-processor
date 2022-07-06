import * as repository from './indexed-block-range';

beforeEach(async () => {
  await repository.save(0, 1);
  await repository.save(2, 3);
  await repository.save(4, 5);
});

afterEach(async () => {
  await repository.Model.deleteMany();
});

describe('Indexed block range repository', () => {
  it('Should get block ranges', async () => {
    const data = await repository.get(1);
    expect(data).toHaveLength(1);
    expect(data[0].startBlock).toStrictEqual(0);
    expect(data[0].endBlock).toStrictEqual(1);
  });

  it('Should get block ranges using a limit', async () => {
    const fetch0 = await repository.get(0);
    expect(fetch0).toHaveLength(3);
    expect(fetch0[0].startBlock).toStrictEqual(0);
    expect(fetch0[0].endBlock).toStrictEqual(1);
    expect(fetch0[1].startBlock).toStrictEqual(2);
    expect(fetch0[1].endBlock).toStrictEqual(3);
    expect(fetch0[2].startBlock).toStrictEqual(4);
    expect(fetch0[2].endBlock).toStrictEqual(5);

    const fetch1 = await repository.get(1);
    expect(fetch1).toHaveLength(1);
    expect(fetch1[0].startBlock).toStrictEqual(0);
    expect(fetch1[0].endBlock).toStrictEqual(1);

    const fetch3 = await repository.get(3);
    expect(fetch3).toHaveLength(3);
    expect(fetch3[0].startBlock).toStrictEqual(0);
    expect(fetch3[0].endBlock).toStrictEqual(1);
    expect(fetch3[1].startBlock).toStrictEqual(2);
    expect(fetch3[1].endBlock).toStrictEqual(3);
    expect(fetch3[2].startBlock).toStrictEqual(4);
    expect(fetch3[2].endBlock).toStrictEqual(5);

    const fetch500 = await repository.get(500);
    expect(fetch500).toHaveLength(3);
    expect(fetch500[0].startBlock).toStrictEqual(0);
    expect(fetch500[0].endBlock).toStrictEqual(1);
    expect(fetch500[1].startBlock).toStrictEqual(2);
    expect(fetch500[1].endBlock).toStrictEqual(3);
    expect(fetch500[2].startBlock).toStrictEqual(4);
    expect(fetch500[2].endBlock).toStrictEqual(5);
  });

  it('Should remove block ranges', async () => {
    const data = await repository.get(0);
    expect(data).toHaveLength(3);

    await repository.remove(data);

    expect(await repository.get(0)).toHaveLength(0);
  });

  it('Should save block ranges', async () => {
    await repository.save(100, 200);
    const data = await repository.get(0);
    expect(data).toHaveLength(4);
    expect(data[3].startBlock).toStrictEqual(100);
    expect(data[3].endBlock).toStrictEqual(200);
  });
});
