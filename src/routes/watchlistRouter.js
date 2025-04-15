import express from "express";
import { addToWatchlist, deleteFromWatchlist, getWatchlist } from "../controllers/watchlistController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router()

// Get all watchlist
router.get("/", protect, getWatchlist)

// Add to watchlist
router.post("/add/:movieId", protect, addToWatchlist);

// Remove from watchlist
router.delete("/delete/:movieId", protect, deleteFromWatchlist);

export {router as watchlistRouter}