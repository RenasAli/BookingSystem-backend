import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Staff extends Model {
  public id!: number;
  public companyId!: number;
  public name!: string;
  public email?: string;
  public phone?: string;
}

Staff.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING }
}, {
  sequelize,
  modelName: 'staff',
  tableName: 'staff',
  timestamps: true
});

export default Staff;
