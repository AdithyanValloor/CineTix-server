import express from "express";
import Stripe from "stripe";
import { protect } from "../middlewares/auth.js";
import { Booking } from "../models/bookingsModel.js";
import { Payment } from "../models/paymentsModel.js";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client = process.env.CLIENT_URL;

// Create Stripe Checkout Session
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { bookingId, seats, totalPrice } = req.body;
    const userId = req.user._id;
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
      success_url: `${client}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${client}/payment-failed`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe session creation failed:", err.message);
    res.status(500).json({ error: "Stripe checkout session failed" });
  }
});

// Polling endpoint to verify payment status
router.post("/verify-payment", protect, async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const bookingId = session.metadata.bookingId;
      const userId = session.metadata.userId;

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

      return res.status(200).json({ success: true, paid: true });
    } else {
      return res.status(200).json({ success: true, paid: false });
    }
  } catch (err) {
    console.error("Stripe polling error:", err);
    res.status(500).json({ success: false, error: "Stripe verification failed." });
  }
});

export { router as paymentRouter };
