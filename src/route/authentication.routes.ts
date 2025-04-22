import {Router} from 'express';
import * as AuthenticationController from '../controller/authentication.controller';

const authenticationRouter = Router();

authenticationRouter.post('/login', async (_req, res) => {
    AuthenticationController.companyLogin(_req, res )
});
authenticationRouter.post('/logout', async (_req, res) => {
    AuthenticationController.logout(_req, res )
});

export default authenticationRouter;