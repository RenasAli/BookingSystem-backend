import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Address extends Model {
  public id!: number;
  public street!: string;
  public city!: string;
  public zipCode!: string;
}

Address.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  street: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  zipCode: {field: 'zip_code', type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: 'address',
  tableName: 'address',
  timestamps: false
});

export default Address;
