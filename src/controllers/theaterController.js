import { Theater } from "../models/theatersModel.js";
import { User } from "../models/userModel.js";

export const addTheater = async (req, res) => {

    console.log("REQ>USER : ", req.user);

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

        console.log("REQ>USER : ", req.user);
        

        await User.findByIdAndUpdate(req.user.id, {
            $push: { theatersOwned: theater._id }
        });

        res.status(201).json({ data: theater, message: "Theater added successfully with sections" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get all theaters
export const getAllTheatersQuery = async (req, res) => {
    try {
        const { query } = req.query; // Search query from the frontend
        const theaters = await Theater.find({
            name: { $regex: query, $options: "i" } // Case-insensitive search
        }).populate("exhibitor", "firstName lastName email profilePicture");

        if (!theaters.length) return res.status(404).json({ message: "No theaters found" });

        res.json({ data: theaters, message: "Theaters fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};


// List all theaters with query
export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find()
            .populate("exhibitor", "firstName lastName email profilePicture") 
            .sort({ createdAt: -1 }); 

        res.status(200).json({ data: theaters, message: "All theaters with exhibitor details fetched successfully" });
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

// Deactivate theater (soft disable)
export const deactivateTheater = async (req, res) => {
    
    console.log("DEACTIVATE HIT");
    
    try {
      const theater = await Theater.findById(req.params.id);
  
      if (!theater) return res.status(404).json({ message: "Theater not found" });
  
      theater.isActive = false;
      theater.deactivatedAt = new Date();
      await theater.save();
  
      res.json({ message: "Theater deactivated successfully", data: theater });
    } catch (error) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
};
  
  // Reactivate theater
export const reactivateTheater = async (req, res) => {
    try {
      const theater = await Theater.findById(req.params.id);
  
      if (!theater) return res.status(404).json({ message: "Theater not found" });
  
      theater.isActive = true;
      theater.deactivatedAt = null;
      await theater.save();
  
      res.json({ message: "Theater reactivated successfully", data: theater });
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

// Delete theater
export const deleteTheaterAdmin = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) return res.status(404).json({ message: "Theater not found" });

        await theater.deleteOne();
        res.json({ message: "Theater deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Get theater by id
export const getTheaterById = async (req, res) => {
    try {
      const theater = await Theater.findById(req.params.id)
        .populate('exhibitor', 'firstName lastName email profilePicture')
        .populate('sections');
  
      if (!theater) {
        return res.status(404).json({ message: 'Theater not found' });
      }
  
      res.status(200).json({ success: true, theater });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
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
