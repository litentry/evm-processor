import mongoose from 'mongoose';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';

const ensuredShardedModels: {[key: string]: boolean} = {};

/**
 * Attempt to shard a collection. This will only be done once per import of
 * this module to avoid performance loss
 * @param models
 */
export async function ensureShardedCollections(
  ...models: mongoose.Model<any>[]
) {
  if (getEnvVar('SHARDING_ENABLED') === 'true') {
    for (const model of models) {
      if (!ensuredShardedModels[model.collection.collectionName]) {
        const shardKey = model.schema.get('shardKey');
        if (shardKey) {
          const documentCount = await model.count();
          if (!documentCount) {
            const adminDb = model.base.connection.db.admin();
            const enableShardingResult = await adminDb.command({
              enableSharding: `${model.db.name}`
            });
            const shardCollectionResult = await adminDb.command({
              shardCollection: `${model.db.name}.${model.collection.collectionName}`,
              key: shardKey,
            });
            console.log(`Sharding ${model.db.name}.${model.collection.collectionName} `)
            console.log({ enableShardingResult, shardCollectionResult });
            if (!enableShardingResult.ok) {
              throw new Error(`Database ${model.db.name} sharding error`);
            }
            if (!shardCollectionResult.ok) {
              throw new Error(`Collection ${model.db.name}.${model.collection.collectionName} sharding error`);
            }
            console.log(`Sharded ${model.db.name}.${model.collection.collectionName}`);
          }
        }
        ensuredShardedModels[model.name] = true;
      }
    }
  }
}

export default ensureShardedCollections;
