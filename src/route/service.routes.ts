import { Router } from 'express';
import * as ServiceController from '../controller/service.controller';
import Role from '../model/enum/Role';
import authorize from '../util/authorize';
import { attachUser } from '../util/attachUser';

const serviceRouter = Router();

serviceRouter.post('/', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    ServiceController.createService(_req, res);
});

serviceRouter.get('/', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) => {
    ServiceController.getAllServices(_req, res);
});

serviceRouter.get('/:id', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) => {
    ServiceController.getServiceById(_req, res);
});

serviceRouter.put('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    ServiceController.updateService(_req, res);
});

serviceRouter.delete('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    ServiceController.deleteService(_req, res);
});

export default serviceRouter;
