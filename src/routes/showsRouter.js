import express from "express";
import { createShow, getShows, updateShow, getShowById, movieByShowId, getShowsForMovie, getAvailableSeats, getActiveMovies, deleteShow, getMoviesByTheater, getMoviesByLocation, getExhibitorShows } from "../controllers/showController.js";
import { protect, authorizeExhibitor } from "../middlewares/auth.js";

const router = express.Router();

// Exhibitor creates a show
router.post("/create-show", protect, authorizeExhibitor, createShow);

// Get all shows of a theater 
router.get("/get-shows", getShows);

// Get exhibitor shows 
router.get("/exhibitor-shows", protect, authorizeExhibitor, getExhibitorShows)

// Get all active movies
router.get("/active-movies", getActiveMovies)

// Get all active movies by theater
router.get("/movies-by-theater/:theaterId", getMoviesByTheater)

// Get shows grouped by theaters for a specific movie
router.get("/movie/:movieId", getShowsForMovie);

// Get available seats
router.get("/:showId/seats", getAvailableSeats)

// Get movie by show by id
router.get("/movie-data/:id", movieByShowId);

// Get show by Id
router.get("/show/:id", getShowById)

// Update a show
router.put("/update-show/:id", protect, authorizeExhibitor, updateShow);

// Delete a show
router.delete("/delete-show/:id", protect, authorizeExhibitor, deleteShow);

// Get movies with location
router.get('/movies-by-location', getMoviesByLocation);


export {router as showsRouter}
