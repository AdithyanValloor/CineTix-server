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
    }, 
    genre: [{ 
        type: String, 
        required: true,
        index: false
    }],
    language: { 
        type: String, 
        required: true 
    }, 
    year: { 
        type: Number 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 10, 
    },
    releaseDate: {
        type: Date
    },
    certification: {
        type: String,
        enum: ["U", "U/A","U-12", "U-16", "A", "PG", "PG-13", "R", "NC-17"],
        default: "U" 
    },    
    castAndCrew: [
        {
            name: { type: String, required: true },
            role: { type: String, required: true }, 
            character: { type: String } 
        }
    ],
    exhibitors: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Exhibitor", 
    }],
    theaters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater"
    }],
    posters: [{ 
        type: String 
    }],
    banners: [{ 
        type: String 
    }],
}, { timestamps: true });

export const Movie = model("Movie", movieSchema);
