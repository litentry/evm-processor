import { ethers } from 'ethers';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';

export function decodeTransfer(data: string, topics: string[]) {
  const decoded = new ethers.utils.Interface(ERC20.abi).decodeEventLog(
    'Transfer(address,address,uint256)',
    data,
    topics,
  );

  return {
    from: decoded[0].toLowerCase(),
    to: decoded[1].toLowerCase(),
    amount: decoded[2],
  };
}
