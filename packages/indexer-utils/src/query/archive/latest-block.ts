import axios from 'axios';
import endpoint from './endpoint';

export default async function latestBlock() {
  try {
    const response = await axios({
      url: endpoint(),
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
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
