import {Router} from 'express';
import * as StaffController from '../controller/staff.controller';
import authorize from '../util/authorize';
import Role from '../model/enum/Role';
import { attachUser } from '../util/attachUser';

const staffRouter = Router();

staffRouter.post('/', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    StaffController.createStaff(_req, res )
});

staffRouter.get('/', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) => {
    StaffController.getAllStaffs(_req, res)
});
staffRouter.get('/:id', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) => {
    StaffController.getStaffById(_req, res)
});
staffRouter.get('/get/profile', authorize(Role.CompanyAdmin, Role.CompanyStaff), attachUser, async (_req, res) => {
    StaffController.getStaffById(_req, res)
});
staffRouter.put('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    StaffController.updateStaff(_req, res)
});
staffRouter.put('/update/profile', authorize(Role.CompanyStaff), attachUser, async (_req, res) => {
    StaffController.updateStaffProfile(_req, res)
});
staffRouter.delete('/:id', authorize(Role.CompanyAdmin), attachUser, async (_req, res) => {
    StaffController.deleteStaff(_req, res)
});
export default staffRouter;