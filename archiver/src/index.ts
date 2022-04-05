import 'dotenv/config';
import fs from 'fs';
import * as ethers from 'ethers';
import { getTransactionsLogsAndContractsByBlock } from './get-transactions-logs-and-contracts-by-block';

const blockNum = 12000000;
// const blockNums: number[] = [];
// for (let i = blockNum; i < blockNum + 100; i++) {
//   blockNums.push(i);
// }

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_ENDPOINT!
  );

  console.time('block');
  const data = await getTransactionsLogsAndContractsByBlock(provider, blockNum);
  console.timeEnd('block');

  fs.writeFileSync(
    `./sample-data/${blockNum}.json`,
    JSON.stringify(data, null, 2)
  );
  process.exit(0);
})();
