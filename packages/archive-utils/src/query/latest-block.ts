import axios from 'axios';
import endpoint from './endpoint';

export default async function latestBlock() {
  const response = await axios({
    url: endpoint,
    method: 'post',
    data: {
      query: `
        query LatestBlock {
          latestBlock
        }
      `,
    },
  });
  return response.data.data.latestBlock as number;
}
