import { hashPassword } from '../../src/util/HashPassword';
import sequelize from '../../src/config/database'
import ConfirmationMethod from '../../src/model/enum/ConfirmationMethod';
import { Address, Booking, Company, CompanyWorkday, Service, Staff, User, Weekday } from '../../src/model';
import { createCompanyAdmin } from '../../src/service/user.service';
import Role from '../../src/model/enum/Role';
import StaffWorkday from '../../src/model/staffWorkday.model';

export const seedTestData = async ()=> {
    const transaction = await sequelize.transaction();

    try {

      const hashedPassword = await hashPassword('123123');

      const dto = {
        companyName: 'Test Salon',
        cvr: '45454545',
        url: 'test-salon',
        companyPhone: '32323223',
        companyEmail: 'test1@salon.dk',
        adminEmail: 'test@test.dk',
        adminName: 'Test Admin',
        adminPassword: '123123',
        logo: 'test-salon.jpg',
        confirmationMethod: ConfirmationMethod.ConfirmationCode, 
        street: 'Parkvej 22',
        city: 'Køge',
        zipCode: '4600',
        workday: [
          { weekdayId: 1, dayName: 'Monday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
          { weekdayId: 2, dayName: 'Tuesday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
          { weekdayId: 3, dayName: 'Wednesday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
          { weekdayId: 4, dayName: 'Thursday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
          { weekdayId: 5, dayName: 'Friday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
          { weekdayId: 6, dayName: 'Saturday', isOpen: true, openTime: '09:00:00', closeTime: '17:00:00' },
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
          email: 'renas@mail.com',
          password: hashedPassword,
          role: Role.CompanyStaff
        },
        { transaction }
      );
      const staffRole2 = await User.create({
          email: 'chris@mail.com',
          password: hashedPassword,
          role: Role.CompanyStaff
        },
        { transaction }
      );

      
      const CompanyAdminAsStaff = await Staff.create(
        {
          companyId: company.id,
          userId: userId,
          name: dto.adminName,
          email: dto.adminEmail,
          phone: "23232323"
        },
        { transaction }
      );
      const staff1 = await Staff.create(
        {
          companyId: company.id,
          userId: staffRole1.id,
          name: 'Renas',
          email: staffRole1.email,
          phone: '12345678'
        },
        { transaction }
      );

      const staff2 = await Staff.create(
        {
          companyId: company.id,
          userId: staffRole2.id,
          name: 'Chris',
          email: staffRole2.email,
          phone: '87654321'
        },
        { transaction }
      );

      const workdays = [];

      for (let weekdayId = 1; weekdayId <= 7; weekdayId++) {
        const isWeekend = weekdayId === 7; // Sunday off

        workdays.push(
          {
            companyId: CompanyAdminAsStaff.companyId,
            staffId: CompanyAdminAsStaff.id,
            weekdayId,
            isActive: !isWeekend,
            startTime: isWeekend ? '00:00:00' : '09:00:00',
            endTime: isWeekend ? '00:00:00' : '17:00:00',
          },
          {
            companyId: staff1.companyId,
            staffId: staff1.id,
            weekdayId,
            isActive: !isWeekend,
            startTime: isWeekend ? '00:00:00' : '09:00:00',
            endTime: isWeekend ? '00:00:00' : '17:00:00',
          },
          {
            companyId: staff2.companyId,
            staffId: staff2.id,
            weekdayId,
            isActive: !isWeekend,
            startTime: isWeekend ? '00:00:00' : '09:00:00',
            endTime: isWeekend ? '00:00:00' : '17:00:00',
          }
        );
      }

      await StaffWorkday.bulkCreate(workdays, { transaction });

      const service1 = await Service.create(
        {
          companyId: company.id,
          name: 'Haircut',
          description: 'Basic haircut',
          price: 200,
          durationMinutes: 30
        },
        { transaction }
      );

      const service2 = await Service.create(
        {
          companyId: company.id,
          name: 'Shave',
          description: 'Classic shave',
          price: 150,
          durationMinutes: 20
        },
        { transaction }
      );

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

          const maxStartHour = closeHour - 1; // allow service to finish before close
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
            customerName: `Customer ${bookingCount + 1}`,
            customerPhone: `555000${bookingCount}`,
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

    } catch (error) {
      await transaction.rollback();
      console.error('Seeding failed:', error);
    }

}