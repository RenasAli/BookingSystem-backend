import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Weekday extends Model {
    public id!: number;
    public name!: string;
}

Weekday.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'weekday',
    tableName: 'weekday',
    timestamps: false
  });


export default Weekday;