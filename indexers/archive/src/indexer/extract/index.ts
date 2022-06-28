import { ExtractBlock } from '../types';
import ankr from './ankr';
import nodereal from './nodereal';
import standard from './standard';

function getExtract() {
  let extractBlock: ExtractBlock;

  switch (process.env.EXTRACTION_SOURCE) {
    case 'nodereal': {
      extractBlock = nodereal;
      break;
    }
    case 'ankr': {
      extractBlock = ankr;
      break;
    }
    default: {
      extractBlock = standard;
    }
  }
  return extractBlock;
}

export default async function extract(startBlock: number, endBlock: number) {
  const blocks: number[] = [];
  for (let block = startBlock; block <= endBlock; block++) {
    blocks.push(block);
  }
  const extractBlock = getExtract();
  return Promise.all(blocks.map(extractBlock));
}
