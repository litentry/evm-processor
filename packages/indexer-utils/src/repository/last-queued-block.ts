import mongoose from 'mongoose';

interface LastQueuedBlockDocument extends mongoose.Document {
  id: string;
  number: number;
}

const LastQueuedBlockSchema = new mongoose.Schema<LastQueuedBlockDocument>({
  id: { type: String, required: true, unique: true, index: true },
  number: { type: Number, required: true },
});

export const Model = mongoose.model('LastQueuedBlock', LastQueuedBlockSchema);
