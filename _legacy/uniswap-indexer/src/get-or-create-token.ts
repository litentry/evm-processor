import dataSource from './data-source';
import { UniswapLPToken } from './model';
import fetchTokenData from './fetchTokenData';

export default async function getOrCreateToken(
  address: string,
): Promise<UniswapLPToken> {
  const tokenRepository = dataSource.getRepository(UniswapLPToken);
  let token = await tokenRepository.findOneBy({ id: address });
  if (!token) {
    // todo replace with archive call when ready
    const data = await fetchTokenData(address);
    token = new UniswapLPToken({ id: address, ...data });
    await dataSource.manager.save(token);
  }

  return token;
}
