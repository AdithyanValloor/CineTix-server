import { Theater } from "../models/theatersModel.js";

// Create a theater
export const addTheater = async (req, res) => {
    try {
        const { name, location, totalSeats } = req.body;

        if (!name || !location || !totalSeats) 
            return res.status(400).json({ message: "All fields are required" });

        const theater = new Theater({
            name,
            location,
            totalSeats,
            exhibitor: req.user.id,
        });

        await theater.save();
        res.status(201).json({ data: theater, message: "Theater added successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Edit theater
export const editTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) return res.status(404).json({ message: "Theater not found" });

        // Only the owner can edit
        if (theater.exhibitor.toString() !== req.user.id)
            return res.status(403).json({ message: "Unauthorized" });

        const { name, location, totalSeats } = req.body;

        if (name) theater.name = name;
        if (location) theater.location = location;
        if (totalSeats) theater.totalSeats = totalSeats;

        await theater.save();
        res.json({ data: theater, message: "Theater updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Delete theater
export const deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) return res.status(404).json({ message: "Theater not found" });

        if (theater.exhibitor.toString() !== req.user.id)
            return res.status(403).json({ message: "Unauthorized" });

        await theater.deleteOne();
        res.json({ message: "Theater deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// List theaters for the exhibitor
export const listTheaters = async (req, res) => {
    try {
        let theaters;
        
        if (req.user.role === "admin") {
            // For ADMIN req
            theaters = await Theater.find();
        } else {
            // For EXHIBITOR req
            theaters = await Theater.find({ exhibitor: req.user.id });
        }

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
