import express from "express";
import { getAvailableSeats } from "../controllers/seatsController.js";

const router = express.Router()

// Get available seats
router.get("/available-seats/:showId", getAvailableSeats)

export {router as seatsRouter}