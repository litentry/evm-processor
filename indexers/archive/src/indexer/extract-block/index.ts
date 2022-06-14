import { ExtractBlock } from '../types';
import ankr from './ankr';
import nodereal from './nodereal';
import standard from './standard';

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

export default extractBlock;
