import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '@subsquid/typeorm-config/lib/namingStrategy';
import { ERC1155Contract, ERC20Contract, ERC721Contract } from './model';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: 'postgres',
  password: 'postgres',
  database: process.env.DB_NAME,
  // todo - make dynamic on model folder
  entities: [ERC1155Contract, ERC20Contract, ERC721Contract],
  namingStrategy: new SnakeNamingStrategy(),
});

export default dataSource;
