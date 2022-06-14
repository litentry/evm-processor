import mongoose from 'mongoose';

const ensuredShardedModels: {[key: string]: boolean} = {};

/**
 * Attempt to shard a collection. This will only be done once per import of
 * this module to avoid performance loss
 * @param models
 */
export async function ensureShardedSchema(
  ...models: mongoose.Model<any>[]
) {
  
  for (const model of models) {
    if (!ensuredShardedModels[model.name]) {
      const shardKey = model.schema.get('shardKey');
      if (shardKey) {
        // get document count
        const documentCount = await model.count();
        if (!documentCount) {
          const adminDb = model.base.connection.db.admin();
          const enableShardingResult = await adminDb.command({
            enableSharding: model.base.connection.name
          });
          const shardCollectionResult = await adminDb.command({
            shardCollection: [
              `${model.base.connection.name}.${model.collection.name}`,
              shardKey
            ]
          });
          console.log({ enableShardingResult, shardCollectionResult });
        }
      }
      ensuredShardedModels[model.name] = true;
    }
  }
}

export async function upsertMongoModels(
  model: mongoose.Model<any>,
  documents: any[],
  primaryKey: string[],
): Promise<void> {
  if (documents.length > 0) {
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

export default upsertMongoModels;
