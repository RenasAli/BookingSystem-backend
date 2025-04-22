import sequelize from '../config/database';

import User from './user.model';
import Company from './company.model';
import Address from './address.model';
import Staff from './staff.model';
import Service from './service.model';
import Booking from './booking.model';

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

// Company - Booking
Company.hasMany(Booking, { foreignKey: 'companyId' });
Booking.belongsTo(Company, { foreignKey: 'companyId' });

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
  Booking
};
