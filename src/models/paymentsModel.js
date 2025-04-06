import mongoose, { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    // e.g., Stripe, Razorpay, Paytm
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["initiated", "success", "failed", "refunded"],
    default: "initiated",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  transactionId: {
    type: String, 
  },
  paymentIntentId: {
    type: String, 
  },
  paymentMethod: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, { timestamps: true });

export const Payment = model("Payment", paymentSchema);
