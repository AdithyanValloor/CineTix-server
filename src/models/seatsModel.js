import mongoose, {Schema, model} from "mongoose";

const seatSchema = new Schema({
    row: { 
        type: String, 
        required: true 
    }, 
    column: { 
        type: Number, 
        required: true 
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
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Movie", 
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
}, { timestamps: true });

export const Seat = model("Seat", seatSchema);
