import extract from './extract';

describe('extract block', () => {
  it.skip('should return the same regardless of API', async () => {
    process.env.ARCHIVE_GRAPH =
      'https://o8s729y427.execute-api.eu-west-1.amazonaws.com/test/graphql';
    const data = await extract(1, 1);
    console.log(data);
    console.log('done');
  });
});
