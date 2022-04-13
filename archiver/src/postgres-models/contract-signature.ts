import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

const ContractSignatureModel = sequelize.define('ContractSignature', {
  blockNumber: { type: DataTypes.NUMBER, allowNull: false },
  blockTimestamp: { type: DataTypes.TIME, allowNull: false },
  contractAddress: { type: DataTypes.STRING, allowNull: false },
  signature: { type: DataTypes.STRING, allowNull: false },
});

export default ContractSignatureModel;
