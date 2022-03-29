import { DataSource } from 'typeorm';
import { UniswapLPSwap, UniswapLPToken } from './model';
import { SnakeNamingStrategy } from '@subsquid/typeorm-config/lib/namingStrategy';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PROCESSOR_DB_HOST,
  port: parseInt(process.env.PROCESSOR_DB_PORT!),
  username: 'postgres',
  password: 'postgres',
  database: process.env.PROCESSOR_DB_DATABASE,
  entities: [UniswapLPSwap, UniswapLPToken],
  namingStrategy: new SnakeNamingStrategy(),
});

export default dataSource;
