import {Router} from 'express';
import * as StaffController from '../controller/staff.controller';

const staffRouter = Router();

staffRouter.post('/', async (_req, res) => {
    StaffController.createStaff(_req, res )
});

staffRouter.get('/', async (_req, res) => {
    StaffController.getAllStaffs(_req, res)
});
staffRouter.get('/:id', async (_req, res) => {
    StaffController.getAllStaffById(_req, res)
});
staffRouter.put('/:id', async (_req, res) => {
    StaffController.updateStaff(_req, res)
});
export default staffRouter;