import { Router } from 'express';
import * as ServiceController from '../controller/service.controller';

const serviceRouter = Router();

serviceRouter.post('/', async (_req, res) => {
    ServiceController.createService(_req, res);
});

serviceRouter.get('/', async (_req, res) => {
    ServiceController.getAllServices(_req, res);
});

serviceRouter.get('/:id', async (_req, res) => {
    ServiceController.getServiceById(_req, res);
});

serviceRouter.put('/:id', async (_req, res) => {
    ServiceController.updateService(_req, res);
});

serviceRouter.delete('/:id', async (_req, res) => {
    ServiceController.deleteService(_req, res);
});

export default serviceRouter;
