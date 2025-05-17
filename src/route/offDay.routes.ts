import {Router} from 'express';
import * as OffDayController from "../controller/offDay.controller";
import Role from '../model/enum/Role';
import authorize from '../util/authorize';
import { attachUser } from '../util/attachUser';

const offDayRouter = Router();

offDayRouter.post('/', authorize(Role.CompanyAdmin), attachUser, async (_req, res) =>{
    OffDayController.createOffDay(_req, res);
});
offDayRouter.get('/', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) =>{
    OffDayController.getAllOffDay(_req, res);
});
offDayRouter.get('/staff', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) =>{
    OffDayController.getAllOffDayByStaffId(_req, res);
});
offDayRouter.put('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) =>{
    OffDayController.updateOffDayById(_req, res);
});
offDayRouter.delete('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) =>{
    OffDayController.deleteOffDayById(_req, res);
});

export default offDayRouter;

