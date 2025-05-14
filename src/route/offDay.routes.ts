import {Router} from 'express';
import * as OffDayController from "../controller/offDay.controller";

const offDayRouter = Router();

offDayRouter.post('/', async (_req, res) =>{
    OffDayController.createOffDay(_req, res);
});
offDayRouter.get('/', async (_req, res) =>{
    OffDayController.getAllOffDay(_req, res);
});
offDayRouter.get('/staff', async (_req, res) =>{
    OffDayController.getAllOffDayByStaffId(_req, res);
});
offDayRouter.put('/:id', async (_req, res) =>{
    OffDayController.updateOffDayById(_req, res);
});
offDayRouter.delete('/:id', async (_req, res) =>{
    OffDayController.deleteOffDayById(_req, res);
});

export default offDayRouter;

