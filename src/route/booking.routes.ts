import {Router} from 'express';
import * as BookingController from "../controller/booking.controller";

const bookingRouter = Router();

bookingRouter.post('/', async (_req, res) => {
    BookingController.createBooking(_req, res )
})

bookingRouter.post('/by-staff', async (_req, res) => {
    BookingController.createBookingByStaff(_req, res )
})

bookingRouter.get('/available-times', async (_req, res) => {
    BookingController.getBookingsTimeSlots(_req, res )
})

bookingRouter.get('/', async (_req, res) => {
    BookingController.getAllBookings(_req, res )
})

bookingRouter.post('/verify-booking', async (_req, res) => {
    BookingController.verifyBookingOtp(_req, res);
});

bookingRouter.get('/:id', async (_req, res) => {
    BookingController.getBookingsById(_req, res )
})

bookingRouter.delete('/:id', async (_req, res) => {
    BookingController.deleteBooking(_req, res )
})

bookingRouter.get('/date/:date', async (_req, res) => {
    BookingController.getBookingByDate(_req, res )
})

bookingRouter.put('/:id', async (_req, res) => {
    BookingController.updateBooking(_req, res )
})

export default bookingRouter;
