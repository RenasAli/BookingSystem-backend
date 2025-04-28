import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import dotenv from 'dotenv';
import companyRoutes from './route/company.routes';
import authenticationRouter from './route/authentication.routes';
import staffRouter from './route/staff.routes';
import serviceRouter from './route/service.routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL
}));

app.use('/api', authenticationRouter);
app.use('/api/company', companyRoutes);
app.use('/api/staff', staffRouter);
app.use('/api/service', serviceRouter);

// DB connect

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