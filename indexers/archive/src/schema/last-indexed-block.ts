import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';

interface LastIndexedBlockDocument extends mongoose.Document {
  id: string;
  number: number;
}

const LastIndexedBlockSchema = new mongoose.Schema<LastIndexedBlockDocument>({
  id: { type: String, required: true, unique: true, index: true},
  number: { type: Number, required: true }
});

export const LastIndexedBlockModel = mongoose.model('LastIndexedBlock', LastIndexedBlockSchema);
