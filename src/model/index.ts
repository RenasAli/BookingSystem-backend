import sequelize from '../config/database';

import User from './user.model';
import Company from './company.model';
import Address from './address.model';
import Staff from './staff.model';
import Service from './service.model';
import Booking from './booking.model';
import Weekday from './weekday.model';
import CompanyWorkday from './companyWorkday.model';
import StaffWorkDay from './staffWorkday.model';
import OffDay from './offDay.model';

// User - Company
User.hasOne(Company, { foreignKey: 'userId' });
Company.belongsTo(User, { foreignKey: 'userId' });

// Address - Company
Address.hasOne(Company, { foreignKey: 'addressId' });
Company.belongsTo(Address, { foreignKey: 'addressId' });

// Company - Staff
Company.hasMany(Staff, { foreignKey: 'companyId' });
Staff.belongsTo(Company, { foreignKey: 'companyId' });

// Company - Service
Company.hasMany(Service, { foreignKey: 'companyId' });
Service.belongsTo(Company, { foreignKey: 'companyId' });

// Company - CompanyWorkDay
Company.hasMany(CompanyWorkday, { foreignKey: 'companyId' });
CompanyWorkday.belongsTo(Company, { foreignKey: 'companyId' });

// Weekday - CompanyWorkDay
Weekday.hasOne(CompanyWorkday, { foreignKey: 'weekdayId' });
CompanyWorkday.belongsTo(Weekday, { foreignKey: 'weekdayId' });

// CompanyWorkDay - weekday
//CompanyWorkday.hasOne(Weekday, { foreignKey: 'weekdayId' });
//Weekday.belongsTo(CompanyWorkday, { foreignKey: 'weekdayId' });

// Weekday - StaffWorkDay
Weekday.hasOne(StaffWorkDay, { foreignKey: 'weekdayId' });
StaffWorkDay.belongsTo(Weekday, { foreignKey: 'weekdayId' });

// Company - Booking
Company.hasMany(Booking, { foreignKey: 'companyId' });
Booking.belongsTo(Company, { foreignKey: 'companyId' });

// Staff - StaffWorkDay
Staff.hasMany(StaffWorkDay, { foreignKey: 'staffId' });
StaffWorkDay.belongsTo(Staff, { foreignKey: 'staffId' });

// Staff - OffDay
Staff.hasMany(OffDay, { foreignKey: 'staffId' });
OffDay.belongsTo(Staff, { foreignKey: 'staffId' });

// Staff - Booking
Staff.hasMany(Booking, { foreignKey: 'staffId' });
Booking.belongsTo(Staff, { foreignKey: 'staffId' });

// Service - Booking
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

export {
  sequelize,
  User,
  Company,
  Address,
  Staff,
  Service,
  Booking,
  Weekday,
  CompanyWorkday,
  StaffWorkDay,
  OffDay,
};
