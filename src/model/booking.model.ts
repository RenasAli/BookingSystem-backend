import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Booking extends Model {
  public id!: number;
  public companyId!: number;
  public staffId!: number;
  public serviceId?: number;
  public customerName!: string;
  public customerPhone!: string;
  public status!: Status;
  public startTime!: Date;
  public endTime!: Date;
  public createdAt?: Date;
}

export enum Status {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
}

Booking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId: { field: 'company_id', type: DataTypes.INTEGER, allowNull: false },
  staffId: { field: 'staff_id', type: DataTypes.INTEGER, allowNull: false },
  serviceId: { field: 'service_id', type: DataTypes.INTEGER, allowNull: true },
  customerName: { field: 'customer_name', type: DataTypes.STRING, allowNull: false },
  customerPhone: { field: 'customer_phone', type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM(Status.pending, Status.confirmed, Status.cancelled),
    allowNull: false},
  startTime: { field: 'start_time', type: DataTypes.DATE, allowNull: false },
  endTime: { field: 'end_time', type: DataTypes.DATE, allowNull: false },
  createdAt: { field: 'created_at', type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: 'booking',
  tableName: 'booking',
  timestamps: false
});

export default Booking;
