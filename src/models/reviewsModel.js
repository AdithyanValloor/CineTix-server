import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    movie: {
      type: mongoose.Types.ObjectId,
      ref: "Movie",
      required: function () {
        return this.reviewType === "movie"; 
      },
    },
    reviewType: {
      type: String,
      enum: ["movie", "theater", "feedback"],
      required: true,
    },
    theater: {
      type: mongoose.Types.ObjectId,
      ref: "Theater",
      required: function () {
        return this.reviewType === "theater"; 
      },
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Review = model("Review", reviewSchema);
