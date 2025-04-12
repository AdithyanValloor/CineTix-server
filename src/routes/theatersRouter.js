import express from "express";
import { addTheater, deleteTheater, editTheater, listTheaters } from "../controllers/theaterController.js";
import { authorizeExhibitor, authorizeExhibitorOrAdmin, protect } from "../middlewares/auth.js";

const router = express.Router()

// Add theater
router.post("/add-theater", protect, authorizeExhibitor, addTheater)

// Edit theater
router.patch("/edit-theater/:id", protect, authorizeExhibitor, editTheater)

// Delete theater
router.delete("/delete-theater/:id", protect, authorizeExhibitor, deleteTheater)

// List theaters
router.get("/list-theaters", protect, authorizeExhibitor, listTheaters)

export {router as theaterRouter}