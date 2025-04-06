import express from "express";
import { bookSeats, getBookingById, getUserBookings, cancelBooking } from "../controllers/bookingController.js"
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Book seats for a show
router.post("/", protect, bookSeats);

// Get user's bookings
router.get("/all-bookings", protect, getUserBookings);

// Get bookings by ID
router.get("/:id", protect, getBookingById)

// Cancel booking
router.delete("/:id", protect, cancelBooking);

export {router as bookingRouter}
