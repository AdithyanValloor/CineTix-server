import mongoose from "mongoose";
import { Show } from "../models/showsModel.js";
import { Booking } from "../models/bookingsModel.js";
import { ShowSeatStatus } from "../models/showSeatStatusModel.js";

// Book Seats
export const bookSeats = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { showId, seatStatusIds } = req.body;

        if (!showId || !seatStatusIds || seatStatusIds.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Show ID and seat selection required" });
        }

        const show = await Show.findById(showId).session(session);
        if (!show) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Show not found" });
        }

        const seatStatuses = await ShowSeatStatus.find({
            _id: { $in: seatStatusIds },
            show: showId,
            isBooked: false
        }).session(session);

        if (seatStatuses.length !== seatStatusIds.length) {
            await session.abortTransaction();
            return res.status(400).json({ message: "One or more selected seats are already booked" });
        }

        // Mark seats as booked
        for (let status of seatStatuses) {
            status.isBooked = true;
            status.bookedBy = req.user._id;
            await status.save({ session });
        }

        console.log("Seat prices:", seatStatuses.map(s => s.price));

        const totalPrice = seatStatuses.reduce((sum, s) => sum + s.price, 0);

        const [booking] = await Booking.create([{
            user: req.user._id,
            show: showId,
            theater: show.theater,
            movie: show.movie,
            exhibitor: show.exhibitor,
            seats: seatStatusIds,
            totalPrice,
            paymentStatus: "pending" // Future: support "paid", "cancelled"
        }], { session });

        const populatedBooking = await Booking.findById(booking._id)
            .populate("seats") // You can add specific fields if needed
            .session(session);

        await session.commitTransaction();

        res.status(201).json({
            data: populatedBooking,
            message: "Seats booked successfully. Proceed to payment!"
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        session.endSession();
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Only user or admin can cancel
        if (
            booking.user.toString() !== req.user._id.toString() &&
            !req.user.isAdmin
        ) {
            return res.status(403).json({ message: "Unauthorized to cancel this booking" });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({ message: "Cannot cancel a paid booking" });
        }

        // Unbook seats
        await ShowSeatStatus.updateMany(
            { _id: { $in: booking.seats } },
            { isBooked: false, bookedBy: null }
        );

        await Booking.deleteOne({ _id: booking._id });

        res.json({ message: "Booking canceled successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get User's Bookings
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("movie", "title genre duration poster")
            .populate("show", "time date screen")
            .populate("theater", "name location")
            .populate("seats", "seat row column seatType isBooked price");

        res.json({ data: bookings });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get Booking Details by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user", "firstName lastName email")
            .populate("movie", "title genre duration poster")
            .populate("show", "date time screen")
            .populate("theater", "name location")
            .populate("seats", "row column seatType isBooked price");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ data: booking });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
