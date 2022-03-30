import * as ethers from 'ethers';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';

export default async function fetchTokenData(address: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_ENDPOINT
  );
  const contract = new ethers.Contract(address, ERC20.abi, provider);
  const decimals = await contract.decimals();
  const name = await contract.name();
  const symbol = await contract.symbol();
  return {
    decimals: decimals ? BigInt(decimals) : null,
    name: name || null,
    symbol: symbol || null,
  };
}
