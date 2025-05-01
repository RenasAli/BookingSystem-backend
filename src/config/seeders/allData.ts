import sequelize from '../database';
import { Company, Address, Staff, Service, Booking, CompanyWorkday, User } from '../../model';
import { createCompanyAdmin } from "../../service/user.service";
import ConfirmationMethod from "../../model/enum/ConfirmationMethod";
import { Weekday } from '../../model';
import bcrypt from 'bcrypt';
import Role from '../../model/enum/Role';

async function seedAll() {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const hashedPassword = await bcrypt.hash('123123', 10);

    // Dummy data
    const dto = {
      companyName: 'Test Salon',
      cvr: '45454545',
      url: 'test-salon',
      companyPhone: '32323223',
      companyEmail: 'test1@salon.dk',
      adminEmail: 'test@test.dk',
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

    // Step 1: Create user (company admin)
    const userId = await createCompanyAdmin(dto, transaction);

    // Step 2: Create address
    const address = await Address.create(
      {
        street: dto.street,
        city: dto.city,
        zipCode: dto.zipCode
      },
      { transaction }
    );

    // Step 3: Create company
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

    // Step 4: Insert workdays
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

    // Step 5: Create staff
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

    // Step 6: Create services
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

    // Step 7: Create bookings
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

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Step 8: Insert bookings
    await Booking.bulkCreate(bookings, { transaction });

    // Commit transaction
    await transaction.commit();

    console.log('Seeding completed successfully!');
  } catch (error) {
    // 🔥 Rollback on failure
    await transaction.rollback();
    console.error('Seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

seedAll();