import mongoose, {Schema, model} from "mongoose";

const watchlistSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movie: [{
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true
    }]
    },{timestamps: true}
)

export const Watchlist = model("Watchlist", watchlistSchema)