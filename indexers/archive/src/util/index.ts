import mongoose from "mongoose";

export async function upsertMongoModels (model: mongoose.Model<any>, documents: any[]) {
  return model.bulkWrite(documents.map((document) => ({
    insertOne: {
      document,
      upsert: true
    }
  })));
}