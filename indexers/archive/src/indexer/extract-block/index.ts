import { ExtractBlock } from '../types';
import ankr from './ankr';
import nodereal from './nodereal';
import standard from './standard';

let extractBlock: ExtractBlock;

switch (process.env.EXTRACT_TYPE) {
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
