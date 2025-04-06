import mongoose, { Schema, model } from "mongoose";

const theaterSchema = new Schema({
    name: {
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    rows: { 
        type: Number, 
        required: true 
    }, 
    columns: { 
        type: Number, 
        required: true 
    }, 
    sections: [
        {
          sectionName: { type: String, required: true },
          seatType: {
            type: String,
            enum: ["Economy", "Regular", "Premium", "Executive", "Recliner", "VIP", "Couple", "Box", "Wheelchair"],
            required: true
          },
          price: { type: Number, required: true },
          rows: [{ type: String, required: true }] 
        }
    ],
    exhibitor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review", 
        },
    ], 
}, { timestamps: true });

export const Theater = model("Theater", theaterSchema);
