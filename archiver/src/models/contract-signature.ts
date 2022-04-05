import { Schema, model } from 'mongoose';
import type { ContractSignature } from '../types';

const contractSignatureSchema = new Schema<ContractSignature>({
  blockNumber: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  signature: { type: String, required: true },
});

contractSignatureSchema.index({ blockNumber: 1 });
contractSignatureSchema.index({ signature: 1 });

const ContractSignatureModel = model<ContractSignature>(
  'ContractSignature',
  contractSignatureSchema
);

export default ContractSignatureModel;
