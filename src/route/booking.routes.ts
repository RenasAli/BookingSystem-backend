import {Router} from 'express';
import * as BookingController from "../controller/booking.controller";


const bookingRouter = Router();

bookingRouter.post('/', async (_req, res) => {
    BookingController.createBooking(_req, res )
})

export default bookingRouter;
