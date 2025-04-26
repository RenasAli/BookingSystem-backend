import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Weekday from './weekday.model';

class StaffWorkday extends Model {
    public id!: number;
    public companyId!: number;
    public staffId!: number;
    public weekdayId!: number;
    public isActive!: boolean;
    public startTime!: string | null;
    public endTime!: string | null;
    public weekday!: Weekday;

  }

  StaffWorkday.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    companyId: { field: 'company_id', type: DataTypes.INTEGER, allowNull: false },
    staffId: { field: 'staff_id', type: DataTypes.INTEGER, allowNull: false },
    weekdayId: { field: 'weekday_id', type: DataTypes.INTEGER, allowNull: false },
    isActive: { field: 'is_active', type: DataTypes.BOOLEAN, allowNull: false },
    startTime: { field: 'start_time', type: DataTypes.TIME, allowNull: true },
    endTime: { field: 'end_time', type: DataTypes.TIME, allowNull: true }
  }, {
    sequelize,
    modelName: 'staffWorkday',
    tableName: 'staff_workday',
    timestamps: false
  });

  export default StaffWorkday;
