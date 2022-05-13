import mongoose from "mongoose";

export async function upsertMongoModels (model: mongoose.Model<any>, documents: any[], primaryKey: string[]): Promise<void> {
  if (documents.length > 0) {
    await model.bulkWrite(documents.map((document) => ({
      updateOne: {
        filter: primaryKey.reduce((filter, field) => ({
          ...filter,
          [field]: document[field]
        }), {}),
        update: {
          ...document
        },
        upsert: true
      }
    })));
  }
}
