import mongoose, { Schema, model } from "mongoose";

const movieSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    duration: { 
        type: Number, 
        required: true 
    }, // Duration in minutes
    genre: { 
        type: String, 
        required: true 
    },
    releaseDate: { 
        type: Date 
    },
    theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Theater", required: true 
    }, // Linked to theater
    exhibitor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    }, // Owned by an exhibitor
}, { timestamps: true });

export const Movie = model("Movie", movieSchema);
