import { Types } from 'indexer-utils';
import { ethers } from 'ethers';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';
import ERC721 from '@openzeppelin/contracts/build/contracts/ERC721.json';
import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import { ContractType } from 'indexer-utils/lib/types/contract';

export type DecodedEvent = {
  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  type1?: string;
  type2?: string;
  type3?: string;
  type4?: string;
};

export type DecodedExtrinsic = {
  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  value5?: string;
  value6?: string;
  type1?: string;
  type2?: string;
  type3?: string;
  type4?: string;
  type5?: string;
  type6?: string;
};

const contractInterface: {
  [key: string]: ethers.utils.Interface;
} = {
  [ContractType.ERC20]: new ethers.utils.Interface(ERC20.abi),
  [ContractType.ERC721]: new ethers.utils.Interface(ERC721.abi),
  [ContractType.ERC1155]: new ethers.utils.Interface(ERC1155.abi),
};

export function decodeEvent(
  type: 20 | 721 | 1155,
  item: Types.Contract.ContractSignatureItem,
  data: string,
  topics: string[],
): DecodedEvent {
  const decoded = contractInterface[`ERC${type}`].decodeEventLog(
    item.SIGNATURE,
    data,
    topics,
  );

  return decoded.reduce((data, value, i) => {
    let val: string = value.toString();
    if (item.PARAMS[i] === 'address') {
      val = val.toLowerCase();
    }
    return {
      ...data,
      [`value${i + 1}`]: val,
      [`type${i + 1}`]: item.PARAMS[i],
    };
  }, {} as DecodedEvent);
}

export function decodeParams(
  params: Types.Contract.ContractSignatureItem['PARAMS'],
  input: string,
): DecodedExtrinsic {
  const decoded = ethers.utils.defaultAbiCoder.decode(
    params,
    ethers.utils.hexDataSlice(input, 4),
  );
  return decoded.reduce((data, value, i) => {
    let val: string = value.toString();
    if (params[i] === 'address') {
      val = val.toLowerCase();
    }
    return {
      ...data,
      [`value${i + 1}`]: val,
      [`type${i + 1}`]: params[i],
    };
  }, {} as DecodedExtrinsic);
}
