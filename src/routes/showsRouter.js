import express from "express";
import { createShow, getShows, updateShow, deleteShow } from "../controllers/showController.js";
import { protect, authorizeExhibitor } from "../middlewares/auth.js";

const router = express.Router();

// Exhibitor creates a show
router.post("/create-show", protect, authorizeExhibitor, createShow);

// Get all shows of a theater 
router.get("/get-shows", getShows);

// Update a show
router.put("/update-show/:id", protect, authorizeExhibitor, updateShow);

// Delete a show
router.delete("/delete-show/:id", protect, authorizeExhibitor, deleteShow);

export {router as showsRouter}
