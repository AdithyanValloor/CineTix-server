import mongoose, { Schema, model } from "mongoose";

const showSeatStatusSchema = new Schema({
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Show", 
        required: true 
    },
    seat: { 
        type: String,  
        required: true 
    },
    price: {
        type: Number,
        required: true,
    },  
    sectionName: {
        type: String,
        required: true,
    },
    seatType: {
        type: String,
        required: true,
    },
    isBooked: { 
        type: Boolean, 
        default: false 
    },
    bookedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null 
    },
    reservationExpiry: Date,
    isReserved: { type: Boolean, default: false },
    rows: Number, 
    columns: Number 

}, { timestamps: true });


export const ShowSeatStatus = model("ShowSeatStatus", showSeatStatusSchema);
