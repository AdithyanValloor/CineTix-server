import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Movie", required: true 
    },
    theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Theater", required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    ticketPrice: { 
        type: Number, 
        required: true 
    },
    seats: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Seat" 
    }], 
    exhibitor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
}, { timestamps: true });

export const Show = mongoose.model("Show", showSchema);
