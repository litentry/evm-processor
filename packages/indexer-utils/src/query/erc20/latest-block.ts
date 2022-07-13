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
            erc20LatestBlock
          }
        `,
      },
    });
    return response.data.data.erc20LatestBlock as number;
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
