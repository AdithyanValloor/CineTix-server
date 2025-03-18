import mongoose, { Schema, model } from "mongoose";

const movieSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    director: { 
        type: String 
    },
    duration: { 
        type: Number, 
        required: true 
    }, // Duration in minutes
    genre: [{ 
        type: String, 
        required: true 
    }],
    language: { 
        type: String, 
        required: true 
    }, 
    year: { 
        type: Date 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
    },
    cast: [
        {
            name: { type: String, required: true },
            role: { type: String, required: true }, 
        }
    ],
    exhibitors: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }],
    theaters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater"
    }]
}, { timestamps: true });

export const Movie = model("Movie", movieSchema);
