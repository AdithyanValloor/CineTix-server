import { Seat } from "../models/seatsModel.js";
import { Show } from "../models/showsModel.js";
import { Booking } from "../models/bookingsModel.js";

// Book Seats
export const bookSeats = async (req, res) => {
    try {
        const { showId, seatIds } = req.body;
        if (!showId || !seatIds || seatIds.length === 0) {
            return res.status(400).json({ message: "Show ID and seat selection required" });
        }

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show not found" });

        // Check if seats are already booked
        const seats = await Seat.find({ _id: { $in: seatIds } });
        const alreadyBooked = seats.some(seat => seat.isBooked);
        if (alreadyBooked) return res.status(400).json({ message: "One or more seats are already booked" });

        // Mark seats as booked
        await Seat.updateMany(
            { _id: { $in: seatIds } },
            { isBooked: true, bookedBy: req.user._id }
        );

        // Calculate total price
        const totalPrice = show.ticketPrice * seatIds.length;

        // Create booking record
        const booking = await Booking.create({
            user: req.user._id,
            show: showId,
            theater: show.theater,
            movie: show.movie,
            seats: seatIds,
            totalPrice,
            paymentStatus: "pending",
        });

        res.status(201).json({ data: booking, message: "Seats booked successfully. Proceed to payment!" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get User's Bookings
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("show theater movie seats");
        res.json({ data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({ message: "Cannot cancel a paid booking" });
        }

        // Free up seats
        await Seat.updateMany(
            { _id: { $in: booking.seats } },
            { isBooked: false, bookedBy: null }
        );

        // Delete booking
        await Booking.deleteOne({ _id: booking._id });

        res.json({ message: "Booking canceled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
