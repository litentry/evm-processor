import web3 from 'web3';

export default function getMethodIdFromSignature(
  signature: string,
  event: boolean,
) {
  if (event) {
    return web3.utils.keccak256(signature).substring(2);
  }
  return web3.utils.keccak256(signature).substring(2, 10);
}
