import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '@subsquid/typeorm-config/lib/namingStrategy';
import { UniswapLPSwap, UniswapLPToken } from './model';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: 'postgres',
  password: 'postgres',
  database: process.env.DB_NAME,
  // todo - make dynamic on model folder
  entities: [UniswapLPSwap, UniswapLPToken],
  namingStrategy: new SnakeNamingStrategy(),
});

export default dataSource;
