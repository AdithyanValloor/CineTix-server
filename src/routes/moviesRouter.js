import express from "express";
import { listMoviesByTheater, addMovie, updateMovie, deleteMovie, getAllMovies } from "../controllers/movieController.js";
import { protect, authorizeExhibitor } from "../middlewares/auth.js";

const router = express.Router();

// List all movies
router.get("/", getAllMovies)

// List movies by theater
router.get("/theater/:theaterId", listMoviesByTheater);

// Add a movie 
router.post("/add", protect, authorizeExhibitor, addMovie);

// Update a movie 
router.put("/update/:movieId", protect, authorizeExhibitor, updateMovie);

// Delete a movie
router.delete("/delete/:movieId", protect, authorizeExhibitor, deleteMovie);

export {router as moviesRouter}