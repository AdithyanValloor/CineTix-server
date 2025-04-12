import mongoose, {Schema, model} from "mongoose";

const bookingSchema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Show", 
        required: true 
    },
    theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Theater", 
        required: true 
    },
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Movie", 
        required: true 
    },
    seats: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ShowSeatStatus", 
        required: true 
    }],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    bookingStatus: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active"
    },
      
    paymentStatus: { 
        type: String, 
        enum: ["pending", "paid"], 
        default: "pending" 
    },
    exhibitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

export const Booking = model("Booking", bookingSchema);