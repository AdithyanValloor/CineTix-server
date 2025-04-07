import express from "express";
import Stripe from "stripe";
import { protect } from "../middlewares/auth.js";
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
      // success_url: `${client}/payment-success`,
      // cancel_url: `${client}/payment-failed`,
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
