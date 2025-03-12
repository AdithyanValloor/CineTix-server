import express from "express";
import { getAvailableSeats } from "../controllers/seatsController.js";

const router = express.Router()

// Get available seats
router.get("/available-seats", getAvailableSeats)

export {router as seatsRouter}