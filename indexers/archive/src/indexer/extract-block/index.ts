import { ExtractBlock } from '../types';
import nodereal from './nodereal';
import standard from './standard';

let extractBlock: ExtractBlock;

switch (process.env.EXTRACT_TYPE) {
  case 'nodereal': {
    extractBlock = nodereal;
    break;
  }
  default: {
    extractBlock = standard;
  }
}

export default extractBlock;
