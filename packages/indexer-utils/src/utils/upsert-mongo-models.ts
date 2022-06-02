import mongoose from 'mongoose';

export default async function upsertMongoModels(
  model: mongoose.Model<any>,
  documents: any[],
  primaryKey: string[],
): Promise<void> {
  if (documents.length > 0) {
    try {
      // First we try inserting here but there might be clashes
      await model.insertMany(documents);
    } catch (error) {
      // If we fail on the above, we try again with the
      // initial implementation to upsert the documents.
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
