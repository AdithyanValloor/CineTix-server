import mongoose, {Schema, model} from "mongoose";

const carouselImageSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    public_id: String,
    caption: String, 
  },
  { timestamps: true }
);

export const CarouselImage = model("CarouselImage", carouselImageSchema);
