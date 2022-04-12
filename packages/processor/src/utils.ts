import * as ethers from 'ethers';

// TODO move these into archive-utils

export function removePrefix(input: string) {
  if (input.substring(0, 2) === '0x') {
    return input.substring(2);
  }
  return input;
}

export function findMethodsInInput(input: string, methods: string[]) {
  return methods.filter((method) => input.includes(method));
}

export function filterCalls(calls: string[], methodIds: string[]): string[] {
  return calls.filter((call) =>
    methodIds.find((methodId) => removePrefix(call).startsWith(methodId))
  );
}

export function decodeCall(input: string, params: string[]) {
  return ethers.utils.defaultAbiCoder.decode(
    params,
    ethers.utils.hexDataSlice(input, 4)
  );
}

export function getMethodIdFromCall(input: string) {
  return input.substring(2, 10);
}

export function get32ByteChunks(input: string) {
  return input.match(/.{1,64}/g) as string[];
}

export function getMethodIdFromSignature(signature: string) {
  return ethers.utils.keccak256(Buffer.from(signature)).substring(2, 10);
}
