import { Schema, model } from 'mongoose';
import type { Types } from 'archive-utils';

const contractSignatureSchema = new Schema<Types.Archive.ContractSignature>({
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  signature: { type: String, required: true },
});

contractSignatureSchema.index({ blockNumber: 1 });
contractSignatureSchema.index({ signature: 1 });

const ContractSignatureModel = model<Types.Archive.ContractSignature>(
  'ContractSignature',
  contractSignatureSchema
);

export default ContractSignatureModel;
