import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import dotenv from 'dotenv';
import companyRoutes from './route/company.routes';
import authenticationRouter from './route/authentication.routes';
import staffRouter from './route/staff.routes';
import serviceRouter from './route/service.routes';
import cookieParser from 'cookie-parser';
import bookingRouter from './route/booking.routes';
import webhookouter from './route/webhooks.routes';
import offDayRouter from './route/offDay.routes';
import smsRouter from './route/sms.route';
import sanitizeAndValidateInput from './util/sanitizeAndValidateInput';


dotenv.config();

const app = express();
app.use('/api/webhook', webhookouter);
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());
app.use(sanitizeAndValidateInput);
app.use('/api', authenticationRouter);
app.use('/api/company', companyRoutes);
app.use('/api/staff', staffRouter);
app.use('/api/service', serviceRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/off-day', offDayRouter);
app.use('/api/sms', smsRouter);

// DB connect
const expectedDB = 'booking_system';
const currentDB = process.env.DB_DATABASE;

if (currentDB !== expectedDB) {
  console.error(`❌ Test aborted: Unsafe DB name "${currentDB}". Expected "${expectedDB}".`);
  process.exit(1);
}
sequelize.authenticate()
  .then(() => console.log('Database connected.'))
  .catch(err => console.error('DB connection failed:', err));

  const PORT = process.env.PORT || 3000;

  sequelize.sync() 
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Sequelize error:', err);
    });


export default app;