import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';

interface LastQueuedBlockDocument extends mongoose.Document {
  id: string;
  number: number;
}

const LastQueuedBlockSchema = new mongoose.Schema<LastQueuedBlockDocument>({
  id: { type: String, required: true, unique: true, index: true },
  number: { type: Number, required: true },
});

export const LastQueuedBlockModel = mongoose.model(
  'LastQueuedBlock',
  LastQueuedBlockSchema
);
