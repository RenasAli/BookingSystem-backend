import {Router} from 'express';
import * as CompanyController from '../controller/company.controller';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../util/cloudinary';
import authorize from '../util/authorize';
import Role from '../model/enum/Role';
import { attachUser } from '../util/attachUser';


const companyRouter = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'companies_logos',
    allowed_formats: ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});

const upload = multer({ storage });

companyRouter.post('/',upload.single('logo'), authorize(Role.Admin), async (_req, res) => {
  CompanyController.createCompanyWithAdmin(_req, res )
});

companyRouter.get('/', authorize(Role.Admin), async (_req, res) => {
  CompanyController.getAllCompanies(_req, res)
});

companyRouter.get('/:id', authorize(Role.Admin, Role.CompanyAdmin), attachUser, async (_req, res) => {
  CompanyController.getCompanyById(_req, res)
});

companyRouter.get('/url/:url', async (_req, res) => {
  CompanyController.getCompanyByURL(_req, res)
});

companyRouter.put('/logo/:id', authorize(Role.Admin), upload.single('logo'), async (_req, res) => {
  CompanyController.updateCompanyLogo(_req, res)
});

companyRouter.put('/:id', authorize(Role.Admin, Role.CompanyAdmin), attachUser, async (_req, res) => {
  CompanyController.updateCompany(_req, res)
});

companyRouter.delete('/:id', authorize(Role.Admin), async (_req, res) => {
  CompanyController.deleteCompany(_req, res)
});

export default companyRouter;