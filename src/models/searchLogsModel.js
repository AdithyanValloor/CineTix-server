import mongoose, {Schema, model} from "mongoose";

const SearchLogSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false 
    }, 
    searchQuery: { 
        type: String, 
        required: true 
    },
    filters: { 
        type: Object 
    }, 
    resultsCount: { 
        type: Number, 
        default: 0 
    },
    },{timestamps: true}
);

export const SearchLog = model("SearchLog", SearchLogSchema);
