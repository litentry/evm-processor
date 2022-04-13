import { CONTRACT_SIGNATURES } from '../contract-signatures';
import { ContractType } from '../types';

export default function isContractType(type: ContractType, sigs: string[]) {
  // const hasEvents = CONTRACT_SIGNATURES[type].EVENTS.every(
  //   ({ ID, REQUIRED }) => {
  //     if (!REQUIRED) return true;

  //     return sigs.includes(ID);
  //   }
  // );
  const hasExtrinsics = CONTRACT_SIGNATURES[type].EXTRINSICS.every(
    ({ ID, REQUIRED }) => {
      if (!REQUIRED) return true;

      return sigs.includes(ID);
    }
  );
  return hasExtrinsics;
}