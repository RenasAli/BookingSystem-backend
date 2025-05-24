import sequelize from '../../src/config/database';
import dotenv from 'dotenv';
import { seedTestData } from './seedTestData';

dotenv.config();

export const setupDBForUnitTest = () => {
  beforeAll(async () => {
    const expectedTestDB = 'test_booking_system';
    const currentDB = process.env.DB_DATABASE;

    if (currentDB !== expectedTestDB) {
      console.error(`❌ Test aborted: Unsafe DB name "${currentDB}". Expected "${expectedTestDB}".`);
      process.exit(1);
    }

    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
    } catch (err) {
      console.error('DB setup failed:', err);
    }
  }, 30000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

}

export const setupTestDB = () => {
  beforeAll(async () => {
    const expectedTestDB = 'test_booking_system';
    const currentDB = process.env.DB_DATABASE;

    if (currentDB !== expectedTestDB) {
      console.error(`❌ Test aborted: Unsafe DB name "${currentDB}". Expected "${expectedTestDB}".`);
      process.exit(1);
    }

    try {
      await sequelize.authenticate();
      await sequelize.sync();
    } catch (err) {
      console.error('DB setup failed:', err);
    }
  }, 30000);

  beforeEach(async () => {
    try {
      await sequelize.sync({ force: true });
      await seedTestData();
    } catch (err) {
      console.error('DB setup failed:', err);
    }
  });
  
  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (err) {
      console.error('DB teardown failed:', err);
    }
  });
};


