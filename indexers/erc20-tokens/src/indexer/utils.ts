import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { ethers } from 'ethers';

export const TRANSFER_EVENT_SIGNATURE =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

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
