import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Weekday from './weekday.model';

class CompanyWorkDay extends Model {
    public id!: number;
    public companyId!: number;
    public weekdayId!: number;
    public isOpen!: boolean;
    public openTime!: string | null;
    public closeTime!: string | null;
    public weekday!: Weekday;
  }

  CompanyWorkDay.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    companyId: {field: 'company_id', type: DataTypes.INTEGER, allowNull: false },
    weekdayId: {field: 'weekday_id', type: DataTypes.INTEGER, allowNull: false },
    isOpen: {field: 'is_open', type: DataTypes.BOOLEAN, allowNull: false },
    openTime: { field: 'open_time', type: DataTypes.TIME, allowNull: true },
    closeTime: { field: 'close_time', type: DataTypes.TIME, allowNull: true }
  }, {
    sequelize,
    modelName: 'companyWorkday',
    tableName: 'company_workday',
    timestamps: false
  });

  export default CompanyWorkDay;
