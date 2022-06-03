import producer from './handler';

jest.mock('../../util/get-latest-block', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return () => 1;
    }),
  };
});

describe('AWS producer', () => {
  it('Returns failed message IDs when process errors', async () => {
    await producer();
  });
});
