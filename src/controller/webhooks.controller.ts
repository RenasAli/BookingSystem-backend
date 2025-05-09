import Stripe from "stripe";
import { Request, Response } from 'express';
import * as BookingService from "../service/booking.service"
import { Status } from "../model/booking.model";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
  });

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
if (!endpointSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET in environment variables.");
}

const paymentStatus = (_req: Request, res: Response)=> {
    const sig = _req.headers['stripe-signature']!;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(_req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return res.status(400).send(`Webhook Error: ${err}`);
    }
    switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const bookingId = session.metadata?.booking_id;
          const companyId = session.metadata?.company_id;
          BookingService.updateBookingStatus(Number(bookingId), Number(companyId), Status.confirmed)
          break;
        }
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const bookingId = session.metadata?.booking_id;
          const companyId = session.metadata?.company_id;
          BookingService.updateBookingStatus(Number(bookingId), Number(companyId), Status.cancelled)
          break;
        }
        default: {
          console.log(`Unhandled event type ${event.type}`);
        }
    }
    res.json({ received: true });
}

export {
    paymentStatus
}