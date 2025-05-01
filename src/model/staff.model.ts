import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import StaffWorkday from './staffWorkday.model';

class Staff extends Model {
  public id!: number;
  public companyId!: number;
  public userId!: number;
  public name!: string;
  public email?: string;
  public phone?: string;
  public createdAt?: Date;
  public workday!: Array<StaffWorkday>; 
  
}

Staff.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId: {field: 'company_id', type: DataTypes.INTEGER, allowNull: false },
  userId: {field: 'user_id', type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  createdAt: {field: 'created_at', type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'staff',
  tableName: 'staff',
  timestamps: false
});

export default Staff;
