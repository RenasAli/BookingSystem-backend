import {Router} from 'express';
import * as CompanyController from '../controller/company.controller';

const companyRouter = Router();

companyRouter.post('/', async (_req, res) => {
  CompanyController.createCompanyWithAdmin(_req, res )
});

companyRouter.get('/', async (_req, res) => {
  CompanyController.getAllCompanies(_req, res)
});
companyRouter.get('/:id', async (_req, res) => {
  CompanyController.getCompanyById(_req, res)
});
companyRouter.put('/:id', async (_req, res) => {
  CompanyController.updateCompany(_req, res)
});
export default companyRouter;