import { query, utils } from 'archive-utils';

const port = process.env.PORT ? parseInt(process.env.PORT) : 4051;
const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK
  ? parseInt(process.env.END_BLOCK)
  : query.latestBlock;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 1000;

const extrinsics = utils.contract.CONTRACT_SIGNATURES.ERC20.EXTRINSICS.filter(
  ({ SIGNATURE }) =>
    [
      'transfer(address,uint256)',
      'approve(address,uint256)',
      'transferFrom(address,address,uint256)',
    ].includes(SIGNATURE)
);

export { port, start, end, batchSize, extrinsics };
