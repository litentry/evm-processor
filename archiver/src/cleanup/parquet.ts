import { Cleanup } from '../types';
import { ParquetInstance } from "../parquet/instance";

/**
 * Close open files
 */
export const withInstance = (instance: ParquetInstance): Cleanup => {
  return async () => {
    return instance.closeAll();
  }
};

export default withInstance;
