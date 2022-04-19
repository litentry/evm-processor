import { CONTRACT_SIGNATURES } from './contract-signatures';
import isType from './is-type';
import getMethodIdFromSignature from './get-method-id-from-signature';
import getParamsFromSignature from './get-params-from-signature';
import supports from './supports';

export default {
  isType,
  supports,
  CONTRACT_SIGNATURES,
  getMethodIdFromSignature,
  getParamsFromSignature,
};
