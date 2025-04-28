import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Role from './enum/Role';

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: Role.Admin | Role.CompanyAdmin | Role.CompanyStaff;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.TEXT, allowNull: false },
  role: {
    type: DataTypes.ENUM(Role.Admin, Role.CompanyAdmin, Role.CompanyStaff),
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'user',
  tableName: 'user',
  timestamps: false
});

export default User;
