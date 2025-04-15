import express from "express";
import { addTheater, deleteTheater, editTheater, listTheaters, getAllTheaters, deactivateTheater, reactivateTheater, deleteTheaterAdmin, getTheaterById, getAllTheatersQuery } from "../controllers/theaterController.js";
import { authorizeAdmin, authorizeExhibitor, protect } from "../middlewares/auth.js";

const router = express.Router()

// Add theater
router.post("/add-theater", protect, authorizeExhibitor, addTheater)

// Edit theater
router.patch("/edit-theater/:id", protect, authorizeExhibitor, editTheater)

// Delete theater
router.delete("/delete-theater/:id", protect, authorizeExhibitor, deleteTheater)

// Deactivate theater by admin
router.put("/deactivate/:id", protect, authorizeAdmin, deactivateTheater)

// Reactivate theater by admin
router.put("/reactivate/:id", protect, authorizeAdmin, reactivateTheater)

// Delete theater by admin
router.delete("/delete/:id", protect, authorizeAdmin, deleteTheaterAdmin)

// Get all theater
router.get("/all-theaters", getAllTheaters)

// Get all theater
router.get("/all-theaters-query", getAllTheatersQuery)

// List theaters
router.get("/list-theaters", protect, authorizeExhibitor, listTheaters)

// Get Theater by id
router.get('/:id', getTheaterById);


export {router as theaterRouter}