import 'dotenv/config';
import { processor } from 'processor';
import handleMulticall from './handle-multicall';

processor([
  {
    startBlock: 14389625,
    contractAddress: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    method: 'multicall(uint256,bytes[])',
    handler: handleMulticall,
  },
]);
