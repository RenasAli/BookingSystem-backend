import { Weekday } from '../../model';
import sequelize from '../database';

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

async function seedWeekdays() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync(); 

    for (const name of weekdays) {
      await Weekday.findOrCreate({
        where: { name },
        defaults: { name }
      });
    }

    console.log('Weekdays seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

seedWeekdays();
