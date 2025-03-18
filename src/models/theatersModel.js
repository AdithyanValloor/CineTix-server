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
