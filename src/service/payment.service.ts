import Stripe from 'stripe';
import { Booking } from '../model';
import { CompanyResponse } from '../dto/ResponseDto/CompanyResponse';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const createPaymentSession = async (booking: Booking, company: CompanyResponse)=>{
    const frontendUrl = process.env.FRONTEND_URL
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                price_data: {
                    currency: 'dkk',
                    product_data: {
                    name: company.name,
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                booking_id: booking.id,
                company_id: booking.companyId,
                customer_name: booking.customerName,
            },
            success_url: `${frontendUrl}/public/booking/${company.url}?status=success`,
            cancel_url: `${frontendUrl}/public/booking/${company.url}?status=cancel`,
        });
    
        return session.url;
    } catch (err) {
        throw new Error("Error create payment session: " + err)
    }
}

export {
    createPaymentSession,
}
