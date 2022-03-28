// todo - revert when we have models generated
import { UniswapLPToken } from './types';
// import { UniswapLPToken } from '../../../generated/schema';
// import { fetchTokenDecimals } from './fetchTokenDecimals';
// import { fetchTokenSymbol } from './fetchTokenSymbol';
// import { fetchTokenName } from './fetchTokenName';

// (from identity-subgraph) need contract types
export default function getOrCreateToken(
  address: string
): Partial<UniswapLPToken> & { id: string } {
  // let token = UniswapLPToken.load(address);
  // if (!token) {
  //   token = new UniswapLPToken(address);
  //   // token.decimals = fetchTokenDecimals(address);
  //   // token.symbol = fetchTokenSymbol(address);
  //   // token.name = fetchTokenName(address);
  //   token.save();
  // }
  return { id: address };
}
