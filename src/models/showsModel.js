import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theater",
    required: true,
  },
  exhibitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  seatPricingOverride: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

export const Show = mongoose.model("Show", showSchema);
