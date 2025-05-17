import express from 'express';
import bodyParser from 'body-parser';
import * as WebhooksController from '../controller/webhooks.controller';

const webhookRouter = express.Router();



webhookRouter.post('/payment-status',bodyParser.raw({ type: 'application/json' }),
 (_req, res) => {
    WebhooksController.paymentStatus(_req, res);
});

export default webhookRouter;