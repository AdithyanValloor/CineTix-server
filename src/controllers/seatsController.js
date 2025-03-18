import { Seat } from "../models/seatsModel.js";
import { Show } from "../models/showsModel.js";

// Get available seats 
export const getAvailableSeats = async (req, res) => {
    try {
        const { showId } = req.params;

        console.log("Show ID : ", showId);
        

        // Validate show existence
        const showExists = await Show.findById(showId);
        if (!showExists) return res.status(404).json({ message: "Show not found" });

        // Find available seats
        const seats = await Seat.find({ show: showId, isBooked: false }).sort({ row: 1, column: 1 });

        if (seats.length === 0) return res.status(404).json({ message: "No available seats for this show" });

        res.json({ data: seats, message: "Available seats fetched" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
