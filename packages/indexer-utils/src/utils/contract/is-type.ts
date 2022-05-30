import { CONTRACT_SIGNATURES } from './contract-signatures';
import { ContractType } from '../../types/contract';

export default function isType(type: ContractType, input: string) {
  const hasEvents = CONTRACT_SIGNATURES[type].EVENTS.every(
    ({ ID, REQUIRED }) => {
      if (!REQUIRED) return true;

      return input.includes(ID);
    },
  );

  if (!hasEvents) return false;

  const hasExtrinsics = CONTRACT_SIGNATURES[type].EXTRINSICS.every(
    ({ ID, REQUIRED }) => {
      if (!REQUIRED) return true;

      return input.includes(ID);
    },
  );

  return hasExtrinsics;
}
