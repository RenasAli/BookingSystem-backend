import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Booking extends Model {
  public id!: number;
  public companyId!: number;
  public staffId!: number;
  public serviceId?: number;
  public customerName!: string;
  public customerPhone!: string;
  public startTime!: Date;
  public endTime!: Date;
}

Booking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  staffId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerPhone: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false }
}, {
  sequelize,
  modelName: 'booking',
  tableName: 'bookings',
  timestamps: true
});

export default Booking;
