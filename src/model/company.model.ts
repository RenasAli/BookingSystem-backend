import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Address from './address.model';
import CompanyWorkday from './companyWorkday.model';
import ConfirmationMethod from './enum/ConfirmationMethod';
import Service from './service.model';

class Company extends Model {
  public id!: number;
  public userId!: number;
  public addressId!: number;
  public cvr!: string;
  public url!: string;
  public name!: string;
  public phone!: string;
  public email!: string;
  public logo?: string;
  public confirmationMethod!: ConfirmationMethod.ConfirmationCode | ConfirmationMethod.Depositum;
  public createdAt!: Date;
  public user!: User;
  public address!: Address;
  public companyWorkdays!: Array<CompanyWorkday>;
}

Company.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {field: 'user_id' ,type: DataTypes.INTEGER, allowNull: false },
  addressId: { field: 'address_id' ,type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  cvr: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  logo: { type: DataTypes.STRING },
  confirmationMethod: {field: 'confirmation_method', type: DataTypes.ENUM(ConfirmationMethod.ConfirmationCode, ConfirmationMethod.Depositum), allowNull: false },
  createdAt: {field: 'created_at', type: DataTypes.DATE }
}, {
  sequelize,
  modelName: 'company',
  tableName: 'company',
  timestamps: false
});

export default Company;
