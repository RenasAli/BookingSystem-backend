import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Address from './address.model';

class Company extends Model {
  public id!: number;
  public userId!: number;
  public addressId!: number;
  public name!: string;
  public phone!: string;
  public createdAt!: Date;
  public user!: User
  public address!: Address
}

Company.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  addressId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE }
}, {
  sequelize,
  modelName: 'company',
  tableName: 'companies',
  timestamps: true
});

export default Company;
