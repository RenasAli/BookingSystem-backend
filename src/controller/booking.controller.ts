import { Request, Response } from 'express';
import * as BookingService from "../service/booking.service";
import BookingRequest from '../dto/RequestDto/BookingRequest';


const createBooking = async (_req: Request, res: Response) => {
    try {
      const request: BookingRequest = _req.body;
      
      const booking = await BookingService.createBooking(request);
  
      return res.status(201).send(booking);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create booking' });
    }
};

const getBookingsTimeSlots = async (_req: Request, res: Response) => {
  try {
    const { companyId, date, duration } = _req.body;

    const slots = await BookingService.getBookingsTimeSlots(Number(companyId), String(date), Number(duration));

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch time slots' });
  }
};

export{
    createBooking,
    getBookingsTimeSlots,
}