import mongoose from 'mongoose';

interface LastQueuedBlockDocument extends mongoose.Document {
  number: number;
}

const LastQueuedBlockSchema = new mongoose.Schema<LastQueuedBlockDocument>(
  {
    number: { type: Number, required: true },
  },
  { capped: { size: 1024, max: 1, autoIndexId: true } }
);

export const Model = mongoose.model('LastQueuedBlock', LastQueuedBlockSchema);
