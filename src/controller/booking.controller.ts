import { Request, Response } from 'express';
import * as BookingService from "../service/booking.service";
import * as PaymentService from "../service/payment.service";
import * as CompanyService from "../service/company.service";
import { sendOtp } from "../service/sms.service";
import BookingRequest from '../dto/RequestDto/BookingRequest';
import ConfirmationMethod from '../model/enum/ConfirmationMethod';
import { verifyOtp } from '../service/sms.service';
import { Status } from "../model/booking.model";

import { CreateBooking } from '../dto/RequestDto/CreateBooking';

const createBooking = async (_req: Request, res: Response) => {
    try {
      const request: BookingRequest = _req.body;
      const company = await CompanyService.getCompanyById(request.companyId)
      const booking = await BookingService.createBooking(request);

      if(company?.confirmationMethod === ConfirmationMethod.Depositum){
        const paymentUrl = await PaymentService.createPaymentSession(booking, company);
        return res.status(201).send(paymentUrl);
      } else if (company?.confirmationMethod === ConfirmationMethod.ConfirmationCode) {
        await sendOtp(booking.customerPhone);
        return res.status(201).json({
          booking, otpSent: true,
          companyId: booking.companyId,
          bookingId: booking.id,
        });
      } else {
        return res.status(201).send(booking);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create booking' });
    }
};

export const verifyBookingOtp = async (req: Request, res: Response) => {
  const { bookingId, companyId, phoneNumber, code } = req.body;

  try {
    const status = await verifyOtp(phoneNumber, code);

    if (status === 'approved') {
      await BookingService.updateBookingStatus(bookingId, companyId, Status.confirmed);
      return res.status(200).json({ message: 'Booking confirmed!' });
    } else {
      return res.status(400).json({ message: 'Incorrect code' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const createBookingByStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
        const dto: CreateBooking = _req.body;
        const booking = await BookingService.createBookingByStaff(dto, companyId);
        return res.status(201).send(`${booking} is created successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create Booking by staff' });
  }
};

const getBookingsTimeSlots = async (_req: Request, res: Response) => {
  try {
    const { companyId, date, duration } = _req.query;

    const slots = await BookingService.getBookingsTimeSlots(Number(companyId), String(date), Number(duration));

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch time slots' });
  }
};

const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const companyId = _req.cookies?.['sessionId'];
    const bookings = await BookingService.getAllBookingsByCompanyId(companyId);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

const getBookingsById = async (_req: Request, res: Response) => {
  try {
    const companyId = _req.cookies?.['sessionId'];
    const booking = await BookingService.getBookingById(Number(_req.params.id), companyId);
    return res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
}

const deleteBooking = async (_req: Request, res: Response) => {
  try {
    const companyId = _req.cookies?.['sessionId'];
    const bookingId = Number(_req.params.id);

    await BookingService.deleteBooking(bookingId, companyId);

    return res.status(200).json({ message: `Booking ${bookingId} deleted successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
}

const getBookingByDate = async (_req: Request, res: Response) => {
  try {
    const companyId = _req.cookies?.['sessionId'];
    const date = _req.params.date;

    if (!companyId || !date) {
      return res.status(400).json({ message: "Missing companyId or date" });
    }

    const bookings = await BookingService.getBookingsByDate(parseInt(companyId), date);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

const updateBooking = async (_req: Request, res: Response) => {
  try {
    const companyId = _req.cookies?.['sessionId'];
    const bookingId = Number(_req.params.id);
    const dto: CreateBooking = _req.body;

    const booking = await BookingService.updateBooking(bookingId, companyId, { ...dto, companyId: Number(companyId) });
    return res.status(200).send(`${booking} is updated successfully!`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
}

export{
    createBooking,
    getBookingsTimeSlots,
    getAllBookings,
    getBookingsById,
    deleteBooking,
    getBookingByDate,
    createBookingByStaff,
    updateBooking
}