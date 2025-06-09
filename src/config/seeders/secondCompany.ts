import sequelize from '../database';
import { Company, Address, Staff, Service, Booking, CompanyWorkday, User } from '../../model';
import { createCompanyAdmin } from "../../service/user.service";
import ConfirmationMethod from "../../model/enum/ConfirmationMethod";
import { Weekday } from '../../model';
import { hashPassword } from '../../util/HashPassword';
import Role from '../../model/enum/Role';
import StaffWorkday from '../../model/staffWorkday.model';

async function seedSecondCompany() {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const hashedPassword = await hashPassword('456456');

    const dto = {
      companyName: 'Second Salon',
      cvr: '98989898',
      url: 'second-salon',
      companyPhone: '56565656',
      companyEmail: 'info@secondsalon.dk',
      adminEmail: 'admin2@salon.dk',
      adminName: 'Second Admin',
      adminPassword: '456456',
      logo: 'second-salon.jpg',
      confirmationMethod: ConfirmationMethod.ConfirmationCode,

      street: 'Hovedgade 10',
      city: 'Roskilde',
      zipCode: '4000',
      workday: [
        { weekdayId: 1, dayName: 'Monday', isOpen: true, openTime: '10:00:00', closeTime: '18:00:00' },
        { weekdayId: 2, dayName: 'Tuesday', isOpen: true, openTime: '10:00:00', closeTime: '18:00:00' },
        { weekdayId: 3, dayName: 'Wednesday', isOpen: true, openTime: '10:00:00', closeTime: '18:00:00' },
        { weekdayId: 4, dayName: 'Thursday', isOpen: true, openTime: '10:00:00', closeTime: '18:00:00' },
        { weekdayId: 5, dayName: 'Friday', isOpen: true, openTime: '10:00:00', closeTime: '18:00:00' },
        { weekdayId: 6, dayName: 'Saturday', isOpen: false, openTime: '00:00:00', closeTime: '00:00:00' },
        { weekdayId: 7, dayName: 'Sunday', isOpen: false, openTime: '00:00:00', closeTime: '00:00:00' }
      ]
    };

    const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < weekdayNames.length; i++) {
      await Weekday.findOrCreate({
        where: { id: i + 1 },
        defaults: {
          id: i + 1,
          name: weekdayNames[i]
        }
      });
    }

    const userId = await createCompanyAdmin(dto, transaction);

    const address = await Address.create(
      {
        street: dto.street,
        city: dto.city,
        zipCode: dto.zipCode
      },
      { transaction }
    );

    const company = await Company.create(
      {
        name: dto.companyName,
        cvr: dto.cvr,
        url: dto.url,
        phone: dto.companyPhone,
        email: dto.companyEmail,
        logo: dto.logo,
        confirmationMethod: dto.confirmationMethod,
        userId: userId,
        addressId: address.id
      },
      { transaction }
    );

    for (const day of dto.workday) {
      await CompanyWorkday.create(
        {
          companyId: company.id,
          weekdayId: day.weekdayId,
          isOpen: day.isOpen,
          openTime: day.openTime,
          closeTime: day.closeTime
        },
        { transaction }
      );
    }

    const staffRole1 = await User.create({
      email: 'maria@second.dk',
      password: hashedPassword,
      role: Role.CompanyStaff
    }, { transaction });

    const staffRole2 = await User.create({
      email: 'jonas@second.dk',
      password: hashedPassword,
      role: Role.CompanyStaff
    }, { transaction });

    const CompanyAdminAsStaff = await Staff.create({
      companyId: company.id,
      userId: userId,
      name: dto.adminName,
      email: dto.adminEmail,
      phone: "11112222"
    }, { transaction });

    const staff1 = await Staff.create({
      companyId: company.id,
      userId: staffRole1.id,
      name: 'Maria',
      email: staffRole1.email,
      phone: '22223333'
    }, { transaction });

    const staff2 = await Staff.create({
      companyId: company.id,
      userId: staffRole2.id,
      name: 'Jonas',
      email: staffRole2.email,
      phone: '33334444'
    }, { transaction });

    const workdays = [];
    for (let weekdayId = 1; weekdayId <= 7; weekdayId++) {
      const isWeekend = weekdayId === 6 || weekdayId === 7;

      workdays.push(
        {
          companyId: CompanyAdminAsStaff.companyId,
          staffId: CompanyAdminAsStaff.id,
          weekdayId,
          isActive: !isWeekend,
          startTime: isWeekend ? '00:00:00' : '10:00:00',
          endTime: isWeekend ? '00:00:00' : '18:00:00',
        },
        {
          companyId: staff1.companyId,
          staffId: staff1.id,
          weekdayId,
          isActive: !isWeekend,
          startTime: isWeekend ? '00:00:00' : '10:00:00',
          endTime: isWeekend ? '00:00:00' : '18:00:00',
        },
        {
          companyId: staff2.companyId,
          staffId: staff2.id,
          weekdayId,
          isActive: !isWeekend,
          startTime: isWeekend ? '00:00:00' : '10:00:00',
          endTime: isWeekend ? '00:00:00' : '18:00:00',
        }
      );
    }

    await StaffWorkday.bulkCreate(workdays, { transaction });

    const service1 = await Service.create({
      companyId: company.id,
      name: 'Facial',
      description: 'Relaxing facial treatment',
      price: 300,
      durationMinutes: 45
    }, { transaction });

    const service2 = await Service.create({
      companyId: company.id,
      name: 'Massage',
      description: 'Full body massage',
      price: 500,
      durationMinutes: 60
    }, { transaction });

    const bookings = [];
    let bookingCount = 0;
    let currentDate = new Date();

    while (bookingCount < 10) {
      const weekdayJs = currentDate.getDay();
      const weekdayId = weekdayJs === 0 ? 7 : weekdayJs;

      const workday = dto.workday.find(w => w.weekdayId === weekdayId);
      if (workday?.isOpen) {
        const [openHour] = workday.openTime.split(':').map(Number);
        const [closeHour] = workday.closeTime.split(':').map(Number);

        const maxStartHour = closeHour - 1;
        const hour = Math.floor(Math.random() * (maxStartHour - openHour + 1)) + openHour;

        const start = new Date(currentDate);
        start.setHours(hour, 0, 0, 0);

        const isEven = bookingCount % 2 === 0;
        const staff = isEven ? staff1 : staff2;
        const service = isEven ? service1 : service2;

        const end = new Date(start.getTime() + service.durationMinutes * 60000);

        bookings.push({
          companyId: company.id,
          staffId: staff.id,
          serviceId: service.id,
          customerName: `Client ${bookingCount + 1}`,
          customerPhone: `666777${bookingCount}`,
          status: 'confirmed',
          startTime: start,
          endTime: end
        });

        bookingCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    await Booking.bulkCreate(bookings, { transaction });

    await transaction.commit();
    console.log('Second company seeding completed!');
  } catch (error) {
    await transaction.rollback();
    console.error('Second company seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

seedSecondCompany();
