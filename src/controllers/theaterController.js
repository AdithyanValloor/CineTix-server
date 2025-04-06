import { Theater } from "../models/theatersModel.js";

export const addTheater = async (req, res) => {
    try {
        const { name, location, rows, columns, sections } = req.body;

        if (!name || !location || !rows || !columns || !sections || !Array.isArray(sections)) {
            return res.status(400).json({ message: "All fields including sections are required" });
        }

        const allSectionRows = sections.flatMap(sec => sec.rows);
        const uniqueRows = new Set(allSectionRows);
        if (uniqueRows.size !== allSectionRows.length) {
            return res.status(400).json({ message: "Duplicate rows found across sections" });
        }

        const theater = new Theater({
            name,
            location,
            rows,
            columns,
            sections,
            exhibitor: req.user.id
        });

        await theater.save();
        res.status(201).json({ data: theater, message: "Theater added successfully with sections" });

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

        const { name, location, rows, columns, sections } = req.body;

        if (name) theater.name = name;
        if (location) theater.location = location;
        if (rows) theater.rows = rows;
        if (columns) theater.columns = columns;

        // Update sections with validation
        if (sections) {
            if (!Array.isArray(sections)) {
                return res.status(400).json({ message: "Sections must be an array" });
            }

            const allSectionRows = sections.flatMap(sec => sec.rows);
            const uniqueRows = new Set(allSectionRows);

            if (uniqueRows.size !== allSectionRows.length) {
                return res.status(400).json({ message: "Duplicate rows found across sections" });
            }

            theater.sections = sections;
        }

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
        
        res.status(200).json({ data: theaters, message: "Theaters fetched successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
