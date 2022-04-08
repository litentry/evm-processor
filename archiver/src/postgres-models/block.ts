import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

const BlockModel = sequelize.define('Block', {
  number: { type: DataTypes.NUMBER, allowNull: false, unique: true },
  hash: { type: DataTypes.STRING, allowNull: false, unique: true },
  parentHash: { type: DataTypes.STRING, allowNull: false },
  nonce: DataTypes.STRING,
  sha3Uncles: { type: DataTypes.STRING, allowNull: false },
  transactionRoot: DataTypes.STRING,
  stateRoot: { type: DataTypes.STRING, allowNull: false },
  miner: { type: DataTypes.STRING, allowNull: false },
  extraData: { type: DataTypes.STRING, allowNull: false },
  gasLimit: { type: DataTypes.NUMBER, allowNull: false },
  gasUsed: { type: DataTypes.NUMBER, allowNull: false },
  timestamp: { type: DataTypes.NUMBER, allowNull: false },
  size: { type: DataTypes.NUMBER, allowNull: false },
  difficulty: { type: DataTypes.STRING, allowNull: false },
  totalDifficulty: { type: DataTypes.STRING, allowNull: false },
  uncles: DataTypes.STRING,
});

export default BlockModel;
