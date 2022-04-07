import fs from 'fs';
import config from './config';

export default async function getStartBlock() {
  /*
  pick up where we left off... we do this with a file, not a DB record because we wil be running lots of these, so we don't want them to interfere with eachothers block range
  */
  if (fs.existsSync('last-indexed-block')) {
    const file = fs.readFileSync('last-indexed-block');
    return parseInt(file.toString()) + 1;
  }

  if (config.startBlock) {
    return config.startBlock;
  }

  return 0;
}
