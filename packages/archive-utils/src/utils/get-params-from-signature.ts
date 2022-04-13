export default function getParamsFromSignature(signature: string) {
  return signature
    .split('(')[1]
    .substring(0, signature.split('(')[1].length - 1)
    .split(',');
}
