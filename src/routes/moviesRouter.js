import express from "express";
import { listMoviesByTheater, addMovie, updateMovie, deleteMovie } from "../controllers/movieController.js";
import { protect, authorizeExhibitor } from "../middlewares/auth.js";

const router = express.Router();

// List movies by theater
router.get("/:theaterId", listMoviesByTheater);

// Add a movie 
router.post("/", protect, authorizeExhibitor, addMovie);

// Update a movie 
router.put("/:movieId", protect, authorizeExhibitor, updateMovie);

// Delete a movie
router.delete("/:movieId", protect, authorizeExhibitor, deleteMovie);


export {router as moviesRouter}