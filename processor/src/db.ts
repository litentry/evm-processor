import { Pool } from 'pg';

let archivePool: Pool;

export function getArchivePool() {
  if (!archivePool) {
    archivePool = new Pool({
      host: process.env.ARCHIVE_DB_HOST,
      user: process.env.ARCHIVE_DB_USER,
      database: process.env.ARCHIVE_DB_DATABASE,
      password: process.env.ARCHIVE_DB_PASSWORD,
      port: parseInt(process.env.ARCHIVE_DB_PORT!),
    });
  }
  return archivePool;
}

let processorPool: Pool;

export function getProcessorPool() {
  if (!processorPool) {
    processorPool = new Pool({
      host: process.env.PROCESSOR_DB_HOST,
      user: process.env.PROCESSOR_DB_USER,
      database: process.env.PROCESSOR_DB_DATABASE,
      password: process.env.PROCESSOR_DB_PASSWORD,
      port: parseInt(process.env.PROCESSOR_DB_PORT!),
    });
  }
  return processorPool;
}
