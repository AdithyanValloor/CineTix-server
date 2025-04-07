import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { Booking } from "../models/bookingsModel.js";
import { Payment } from "../models/paymentsModel.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

    console.log("🔥 HITTING WEBHOOK 🔥");

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;
      const userId = session.metadata.userId;

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

        console.log(`✅ Booking ${bookingId} marked as paid`);
      } catch (err) {
        console.error("❌ Error updating booking/payment:", err.message);
      }
    }

    res.json({ received: true });
  }
);

export default router;
