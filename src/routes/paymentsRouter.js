import express from "express";
import Stripe from "stripe";
import { protect } from "../middlewares/auth.js";
import { Booking } from "../models/bookingsModel.js";
import { Payment } from "../models/paymentsModel.js";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client = process.env.CLIENT_URL

// Create Stripe Checkout Session
router.post("/create-checkout-session", protect, async (req, res) => {
  try {

    console.log("CLIENT : ", client);

    const { bookingId, seats, totalPrice } = req.body;

    const userId = req.user._id

    // Safety check for seats array
    const seatList = Array.isArray(seats) ? seats.join(", ") : "No seats selected";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `CineTix Booking - Seats: ${seatList}`,
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        bookingId,
        userId: userId.toString(),
      },
  
      success_url: `https://cine-tix-client.vercel.app/payment-success`,
      cancel_url: `https://cine-tix-client.vercel.app/payment-failed`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe session creation failed:", err.message);
    res.status(500).json({ error: "Stripe checkout session failed" });
  }
});

export { router as paymentRouter };


// Webhook Handler 

router.post("/webhook-handler", async (req, res) => {
  const apiKey = req.headers.authorization?.split(" ")[1];

  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { bookingId, userId, session } = req.body;

  try {
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
    });

    await Payment.create({
      booking: bookingId,
      user: userId,
      provider: "Stripe",
      status: "success",
      amount: session.amount_total / 100,
      currency: session.currency,
      transactionId: session.id,
      paymentIntentId: session.payment_intent,
      paymentMethod: session.payment_method_types[0],
      metadata: session,
    });

    console.log(`✅ Booking ${bookingId} marked as paid via microservice`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Payment handling failed:", err.message);
    res.status(500).json({ error: "Failed to update booking/payment" });
  }
});
