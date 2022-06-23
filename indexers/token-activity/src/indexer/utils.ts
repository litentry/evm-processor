import { utils, Types } from 'indexer-utils';
import { ethers } from 'ethers';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';
import ERC721 from '@openzeppelin/contracts/build/contracts/ERC721.json';
import ERC1155 from '@openzeppelin/contracts/build/contracts/ERC1155.json';
import { DecodedEvent, DecodedExtrinsic, ErcStandard } from './types';

export const standards: ErcStandard[] = [20, 721, 1155];

export function getSignaturesByErcStandard(ercStandard: ErcStandard) {
  switch (ercStandard) {
    case 20:
      return utils.contract.CONTRACT_SIGNATURES.ERC20.EVENTS;
    case 721:
      return utils.contract.CONTRACT_SIGNATURES.ERC721.EVENTS;
    case 1155:
      return utils.contract.CONTRACT_SIGNATURES.ERC1155.EVENTS;
    default:
      throw Error('unknown standard');
  }
}

const contractInterface: {
  [key: string]: ethers.utils.Interface;
} = {
  [Types.Contract.ContractType.ERC20]: new ethers.utils.Interface(ERC20.abi),
  [Types.Contract.ContractType.ERC721]: new ethers.utils.Interface(ERC721.abi),
  [Types.Contract.ContractType.ERC1155]: new ethers.utils.Interface(
    ERC1155.abi,
  ),
};

export function decodeLog(
  type: ErcStandard,
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
    ethers.utils.hexDataSlice(handleWeirdLeftPaddedAddresses(input, params), 4),
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

/*
Some ERC20 transfer(address, unit256) transactions (e.g. https://etherscan.io/tx/0x92a0d3e9190cdb9ae986e95a922452bb864835130e7c382265a6c6689d71fa19) left pad the receiver address with apparently random characters instead of the usual zeros. This results in ethers.utils.defaultAbiCoder.decode giving us a Getter value that throws this when accessed:

value out of range (argument="value", value=20, code=INVALID_ARGUMENT, version=bytes/5.1.0)

Replacing the odd padding with zeros fixes this issue, at least for this particular extrinsic.
*/
function handleWeirdLeftPaddedAddresses(
  input: string,
  params: Types.Contract.ContractSignatureItem['PARAMS'],
): string {
  let formatted = input;

  if (params[0] === 'address') {
    formatted =
      input.substring(0, 10) + '000000000000000000000000' + input.substring(34);
  }

  return formatted;
}
