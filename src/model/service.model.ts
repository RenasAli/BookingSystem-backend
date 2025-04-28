import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Service extends Model {
  public id!: number;
  public companyId!: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public durationMinutes!: number;
}

Service.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId: { field: 'company_id', type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  durationMinutes: {field: 'duration_minutes', type: DataTypes.INTEGER, allowNull: false }
}, {
  sequelize,
  modelName: 'service',
  tableName: 'service',
  timestamps: false
});

export default Service;
