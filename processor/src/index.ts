import 'dotenv/config';
import getMulticalls from './get-multicalls';
import handleMulticall from './handle-multicall';

async function run() {
  const txs = await getMulticalls(14389625, 14389700);

  for (let i = 0; i < txs.length; i++) {
    await handleMulticall(txs[i]);
  }
}

run();
