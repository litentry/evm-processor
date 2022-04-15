import { Types } from 'archive-utils';
import { ethers } from 'ethers';

export default function decode(
  params: Types.Contract.ContractSignatureItem['PARAMS'],
  input: string
) {
  const decoded = ethers.utils.defaultAbiCoder.decode(
    params,
    ethers.utils.hexDataSlice(input, 4)
  );
  return decoded.reduce(
    (data, value, i) => {
      let val: string = value.toString();
      if (params[i] === 'address') {
        val = val.toLowerCase();
      }
      return {
        ...data,
        [`value${i + 1}`]: val,
        [`type${i + 1}`]: params[i],
      };
    },
    {} as {
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
    }
  );
}
