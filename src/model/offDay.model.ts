import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Staff from './staff.model';

class OffDay extends Model {
    public id!: number;
    public staffId!: number;
    public startDate!: string;
    public endDate!: string;
    public staff?: Staff;
}

  OffDay.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    staffId: { field: 'staff_id',  type: DataTypes.INTEGER, allowNull: false },
    startDate: { field: 'start_date', type: DataTypes.DATE, allowNull: false },
    endDate: { field: 'end_date', type: DataTypes.DATE, allowNull: false },
  }, {
    sequelize,
    modelName: 'offDay',
    tableName: 'off_day',
    timestamps: false
  });

  export default OffDay;
