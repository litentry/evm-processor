import mongoose from 'mongoose';

export default async function upsertMongoModels(
  model: mongoose.Model<any>,
  documents: any[],
  primaryKey: string[],
): Promise<void> {
  if (documents.length > 0) {
    try {
      await model.bulkWrite(
        documents.map((document) => ({
          insertOne: document,
        })),
      );
    } catch (error) {
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
    }
  }
}
