import mongoose from 'mongoose';

const upsert = async (
  model: mongoose.Model<any>,
  documents: any[],
  primaryKey: string[],
): Promise<void> => {
  await model.bulkWrite(
    documents.map((document) => ({
      updateOne: {
        filter: primaryKey.reduce(
          (filter, field) => ({
            ...filter,
            [field]: document[field],
          }),
          {},
        ),
        update: {
          ...document,
        },
        upsert: true,
      },
    })),
  );
};

export default async function upsertMongoModels(
  model: mongoose.Model<any>,
  documents: any[],
  primaryKey: string[],
): Promise<void> {
  if (documents.length > 0) {
    try {
      await model.collection.insertMany(documents);
    } catch (error) {
      await upsert(model, documents, primaryKey);
    }
  }
}
