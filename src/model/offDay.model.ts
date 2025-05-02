import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OffDay extends Model {
    public id!: number;
    public staffId!: number;
    public date!: Date;
    public startTime?: string;
    public endTime?: string;
}

  OffDay.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    staffId: { field: 'staff_id',  type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    startTime: { field: 'start_time', type: DataTypes.TIME, allowNull: false },
    endTime: { field: 'end_time', type: DataTypes.TIME, allowNull: false },
  }, {
    sequelize,
    modelName: 'offDay',
    tableName: 'off_day',
    timestamps: false
  });

  export default OffDay;
