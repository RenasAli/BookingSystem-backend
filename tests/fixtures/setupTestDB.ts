import sequelize from '../../src/config/database';
import dotenv from 'dotenv';

dotenv.config();

export const setupTestDB = () => {
  beforeAll(async () => {
    const expectedTestDB = 'test_booking_system';
    const currentDB = process.env.DB_DATABASE;

    if (currentDB !== expectedTestDB) {
      console.error(`❌ Test aborted: Unsafe DB name "${currentDB}". Expected "${expectedTestDB}".`);
      process.exit(1); // Hard exit to avoid accidental data loss
    }

    try {
      await sequelize.authenticate();
      console.log('Database connected.');
      await sequelize.sync({ force: true });
    } catch (err) {
      console.error('DB setup failed:', err);
    }
  }, 30000);

  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (err) {
      console.error('DB teardown failed:', err);
    }
  });
};
